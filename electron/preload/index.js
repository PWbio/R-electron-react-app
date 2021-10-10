const getSysVersion = () => {
  let version = {};
  ["chrome", "node", "electron"].map((v) => (version[v] = process.versions[v]));
  return version;
};

module.exports = {
  sysVer: getSysVersion(),
};
