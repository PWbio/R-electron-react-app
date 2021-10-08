import React from "react";
import S from "./Header.module.scss";
import { Tag } from "antd";

const Header = () => {
  return (
    <div className={S.container}>
      <span className={S.appName}>R-Electron-App</span>
      <div>
        <Tag color="cyan">
          Electron {window.preloadAPI.sysVer.electron || "Unknown"}
        </Tag>
        <Tag color="volcano">
          Chrome {window.preloadAPI.sysVer.chrome || "Unknown"}
        </Tag>
        <Tag color="green">
          Node {window.preloadAPI.sysVer.node || "Unknown"}
        </Tag>
      </div>
    </div>
  );
};

export default Header;
