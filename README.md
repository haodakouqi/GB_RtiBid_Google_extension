# RtiBid Pixel Helper

## 项目介绍

RtiBid Pixel Helper 是一款 Chrome 浏览器扩展程序，专门用于监控和验证 RtiBid Pixel 的运行状态。它可以帮助您：

- 检查像素安装是否正确
- 识别并提示错误信息
- 提供实施建议
- 简化像素问题排查流程


## google 提交审核

#### 说明

The RtiBid Pixel Helper is a tool to your pixel implementation.

While browsing any site, the extension badge will show the number of RtiBid Pixel events firing on a page. Open the extension on any page with the pixel implemented to see which events are actively firing, identify any errors in their configuration, and get recommendations for fixing errors. 

#### 选则

开发者工具
英语

###### 隐私权

单一用途说明*
The RtiBid  Pixel Helper is a troubleshooting tool that helps you validate your pixel implementation.


需请求storage的理由*
Need to put pixel data in storage

需请求activeTab的理由*
The activeTab permission is requested to ensure that the extension only runs on tabs that are actively activated by the user.

需请求webNavigation的理由*
The Pixel Helper plugin requests webNavigation permissions mainly to provide more complete and accurate pixel analysis functions.

需请求tabs的理由*
The Pixel Helper plugin requests tabs permissions mainly to implement pixel analysis related functions that are critical to user experience.

需请求webRequest的理由*
The webRequest permission allows us to monitor and intercept web requests, which is critical to ensuring the accuracy and integrity of pixel analytics

需请求主机权限的理由*
This plugin requests host permissions in order to be able to interact effectively with the web page the user is visiting


## 技术支持

如果您在使用过程中遇到问题，请联系我们的技术支持团队：
- 电子邮件：support@rtibid.com
- 官方网站：https://www.rtibid.com

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进本项目。

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。