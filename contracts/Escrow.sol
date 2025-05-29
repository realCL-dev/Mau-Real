//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.28;
interface IERC {
    function transferFrom(address _from, address _to, uint256 _Id) external;
}

contract Escrow {
    address payable public seller;
    address public lender;
    address public valuator;
    address public nftAddress;

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
}
