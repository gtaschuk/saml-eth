const RBAC = artifacts.require("./RBAC.sol");

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(RBAC);

    const rbac = await RBAC.deployed();

    // add the roles that users might have
    await rbac.addUserRole("employee");
    await rbac.addUserRole("hr");
    await rbac.addUserRole("ceo");

    // grant that role to the user who is deploying the contracts
    // the deploy user also has the ability to add other users to the RBAC
    await rbac.grantRole(accounts[0], "employee");
  });
};
