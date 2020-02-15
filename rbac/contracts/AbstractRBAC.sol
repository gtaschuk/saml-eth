pragma solidity 0.5.10;

interface AbstractRBAC {
  function checkRole(address _operator, string calldata _role) view external;
  //function hasRole(address _operator, string calldata _role) view external returns (bool);
  //function userExists(address _user) view external returns (bool);
  //function newUser(address _addr, string calldata _display, uint _roles) external;
  //function getUserDisplay(address _addr) view external returns (string memory);
  //function grantRole(address user, string calldata roleName) external;
  //function revokeRole(address user, string calldata roleName) external;
  //function getUserRoleBitmask(address _addr) view external returns (uint);
}
