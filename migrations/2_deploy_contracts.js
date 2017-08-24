var BetContract = artifacts.require("BetContract.sol");
module.exports = function(deployer) {
  deployer.deploy(BetContract);
};
