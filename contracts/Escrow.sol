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
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;

    modifier onlySeller() {
        require(msg.sender == seller, "Only the Seller can call this function");
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
        uint256 _escrowAmount
    ) public payable onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);
        isListed[_nftId] = true;
        buyer[_nftId] = _buyer;
        purchasePrice[_nftId] = _purchasePrice;
        escrowAmount[_nftId] = _escrowAmount;
    }
}
