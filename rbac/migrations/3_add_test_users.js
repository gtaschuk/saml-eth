const RBAC = artifacts.require("./RBAC.sol");

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const rbac = await RBAC.deployed();

    // add the roles that users might have
    // grant that role to the user who is deploying the contracts
    // the deploy user also has the ability to add other users to the RBAC
    await rbac.newUser("0xd5C73aFc966c456D770332411E448A550e00771b", "Test", 0);
    await rbac.grantRole("0xd5C73aFc966c456D770332411E448A550e00771b", "employee");
  });
};
