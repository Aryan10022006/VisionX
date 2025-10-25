//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { PropShare } from "../contracts/PropShare.sol";

contract DeployPropShare is ScaffoldETHDeploy {
    // use `deployer` from `ScaffoldETHDeploy`
    function run() external ScaffoldEthDeployerRunner {
        PropShare propShare = new PropShare(deployer);
        console.log("PropShare deployed at:", address(propShare));
    }
}
