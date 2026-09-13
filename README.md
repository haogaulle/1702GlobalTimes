# 环球时报电子化
！法兰西文化局重点项目
本仓库收录了一组可直接在浏览器中阅读的 HTML 文章，并通过 GitHub Pages 对外发布。

## 在线阅读

启用 GitHub Pages 后，可通过以下地址访问首页：

```text
https://<你的 GitHub 用户名>.github.io/<仓库名>/
```

首页会列出仓库中的全部文章：

- 《挪威政府关于政权托管安排的公函》（高峰论坛 · 政府博客）
- 《又一场慕尼黑？》
- 《川吉尔，一代政坛硬汉》
- 《恐怖主义再次抬头，英联邦如何应对？》
- 《英国内政危机，川吉尔能否力挽澜？》

## 本地预览

直接用浏览器打开 `index.html`，即可从首页进入各篇文章。

## 发布到 GitHub Pages

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment** 中，将 **Source** 设为 **GitHub Actions**。
3. 将 `.github/workflows/pages.yml` 随项目提交并推送到 `master` 分支，工作流会自动发布。
4. 在仓库的 **Actions** 中查看 **Deploy static site to GitHub Pages** 的运行结果；也可以选择该工作流，点击 **Run workflow** 并选择 `master` 手动发布。
5. 等待部署成功；Pages 设置页面和工作流的部署记录会显示访问网址。

工作流直接发布仓库根目录的静态文件，无需安装依赖或运行构建。以后每次推送到 `master` 都会自动更新网站，无需额外配置密钥。

仓库保留了 `CNAME` 文件中的自定义域名 `1702gts.top`。使用 GitHub Actions 发布时，还需确保 **Settings → Pages → Custom domain** 中仍设置了该域名，不能仅依赖 `CNAME` 文件。

## 内容说明

- `index.html`：GitHub Pages 首页及文章导航。
- `*.html`：可直接阅读的文章页面。
- `*.txt`：对应文章的纯文本版本。

> 提示：文章文件名包含中文及标点。首页已对链接中的特殊字符进行编码，建议保留现有文件名，避免链接失效。
