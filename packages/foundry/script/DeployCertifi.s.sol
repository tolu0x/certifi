//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./DeployHelpers.s.sol";
import "../contracts/Certifi.sol";

contract DeployCertifi is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey("You don't have a deployer account. Run `yarn generate` to create one");
        }

        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        Certifi certifi = new Certifi(deployer);

        console.logString(string.concat("Certifi deployed at: ", vm.toString(address(certifi))));

        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the nextjs application.
         */
        exportDeployments();
    }

    function test() public {}
}