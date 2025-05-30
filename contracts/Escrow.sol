//SPDX-License-Identifier: Unlicense
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

pragma solidity ^0.8.28;

contract Escrow {
    address payable public seller;
    address public lender;
    address public valuator;
    address public nftAddress;

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public depositAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public valuationPassed; //defaults to false
    mapping(uint256 => mapping(address => bool)) public approval;

    modifier onlySeller() {
        require(msg.sender == seller, "Only the Seller can call this function");
        _;
    }
    modifier onlyBuyer(uint256 _nftId) {
        require(
            msg.sender == buyer[_nftId],
            "Only the Buyer can call this function"
        );
        _;
    }

    modifier onlyValuator() {
        require(
            msg.sender == valuator,
            "Only the Valuator can call this function"
        );
        _;
    }

    constructor(
        address _nftAddress,
        address payable _seller,
        address _valuator,
        address _lender
    ) {
        nftAddress = _nftAddress;
        lender = _lender;
        valuator = _valuator;
        seller = _seller;
    }

    function list(
        uint256 _nftId,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _depositAmount
    ) public payable onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);
        isListed[_nftId] = true;
        buyer[_nftId] = _buyer;
        purchasePrice[_nftId] = _purchasePrice;
        depositAmount[_nftId] = _depositAmount;
    }

    // Put under contract (only buyer -  payable to the Escrow smart Contract)
    function payDeposit(uint256 _nftId) public payable onlyBuyer(_nftId) {
        require(msg.value >= depositAmount[_nftId]);
    }

    function updateValuationStatus(
        uint256 _nftId,
        bool _passed
    ) public onlyValuator {
        valuationPassed[_nftId] = _passed;
    }

    // Approve sale
    function approveSale(uint256 _nftId) public {
        approval[_nftId][msg.sender] = true;
    }

    // Finalize the sale
    function finalizeSale(uint256 _nftId) public {
        require(valuationPassed[_nftId]);
        require(approval[_nftId][buyer[_nftId]]);
        require(approval[_nftId][seller]);
        require(approval[_nftId][lender]);
        address(this).balance >= purchasePrice[_nftId];

        isListed[_nftId] = false;

        (bool success, ) = seller.call{value: address(this).balance}("");
        require(success);

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftId], _nftId);
    }

    function cancelSale(uint256 _nftId) public {
        uint256 deposit = depositAmount[_nftId];
        address payable _buyer = payable(buyer[_nftId]);
        if (valuationPassed[_nftId] == false) {
            _buyer.transfer(address(this).balance);
        } else {
            // Return deposit to buyer
            if (deposit > 0 && address(this).balance >= deposit) {
                _buyer.transfer(deposit);
            }
            // Send the rest to the lender
            uint256 remaining = address(this).balance;
            if (remaining > 0) {
                payable(lender).transfer(remaining);
            }
        }
    }

    // Helper function to get the balance of the smart contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Function to allow the Smart Contract to receive funds that will be kept in Escrow
    receive() external payable {}
}