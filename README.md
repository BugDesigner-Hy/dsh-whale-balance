# Whale Balance · 余额水杯

[English](#english) · [中文](#中文)

**English** — A DeepSeek Harness (DSH) plugin that turns your account balance into water inside the whale mark: the level fills against a full amount you set, the surface keeps rippling, and a hover panel shows exact amounts, spend, remaining days and a top-up link.

**中文** — 把 DeepSeek 账户余额显示成鲸鱼标志里上涨的水面：水位按你设置的满杯金额线性变化，水面持续荡漾；悬停面板给出精确金额、今日/近 7 天消耗、还能用几天，以及充值入口。

---

## English

### Install

From npm:

```bash
dsh plugin --profile desktop add dsh-whale-balance
```

Straight from GitHub:

```bash
dsh plugin --profile desktop add "git+https://github.com/BugDesigner-Hy/dsh-whale-balance.git"
```

Then enable **Whale Balance** on the Plugins page. The plugin is also listed in the [Open Plugin Market](https://dshopen.org) — add `https://dshopen.org/index.json` under **Discover → Add index source** and search for `whale` or `balance`.

### What you get

- A 46px floating whale mark in the bottom-right corner (`shell.overlay`). Drag it anywhere; the position is remembered and clamped to the window.
- Water height = `balance / full amount`, capped at full. The full amount is per currency and set in the panel's gear.
- Two drifting wave layers inside the whale silhouette, plus a ±4° sway of the mark so the tail moves most.
- Live balance from the account watch stream: login, top-up and sign-out push a frame immediately. Falls back to 60 s polling when the stream is unavailable.
- Hover panel: wallet totals (recharge + bonus; click a currency to make it the vessel's basis), the bonus share, today's and last-7-day spend, an estimate of remaining days, a low-balance warning, refresh, and **Top up**.
- Clicking the mark only opens the panel — it never navigates; top-up has its own link.
- Low balance: amber water, amber ring and a three-pulse alert. The threshold is either an amount or a percentage of the full amount.
- Only theme tokens for the container, focus rings and text; `prefers-reduced-motion` disables the ripples, sway, pulses and spinner. UI is localized (English / Chinese).

### Settings

| Setting | Default | Notes |
| --- | --- | --- |
| Full amount | ¥100 (USD $15) | Spendable total (recharge + bonus) at which the vessel is full; set 1000 to make 1000 the top |
| Alert mode | amount | `amount` or `percent` |
| Alert threshold | ¥5 (USD $1) | Below it the water turns amber and the mark pulses three times |
| Percent threshold | 10% | Used in percent mode: threshold = full amount × percent |

Full amount and amount threshold are stored per currency (CNY / USD); the percentage is global. Everything lives in `localStorage` and applies immediately; **Reset** restores the defaults.

### How the level works

- Linear: `(recharge + bonus) / full amount`, capped at 1. 40 of 100 fills 40% of the height.
- Spend figures come from the balance decreases this plugin observes while the app runs, so they are an estimate, not a bill. The ledger tracks the recharge and bonus wallets together (the platform spends the bonus first), and both the today and 7-day rows are always shown — `0.00` when nothing has been observed yet.
- Days left divides the usable total (recharge + bonus) by the extrapolated daily spend from the last seven days of observations, and stays hidden until there is at least one day of history.

### Where the data comes from

The browser reads the same account Remote as **Settings → Account**:

```js
ctx.get('remote').$stream({ name: 'account', open: (signal) => account.watch(signal) })   // live state
ctx.get('remote.account').getBalance({ version, locale, timezoneOffsetSeconds })          // balance
```

No API key is stored and the plugin makes no external network requests.

### Limits

- Spend history and settings are kept in `localStorage` per origin; a desktop build that changes ports starts collecting again.
- Spend is observed only while the app is running, so long offline periods are not attributed.

### License

MIT © 2026 BugDesigner-Hy. The whale path comes from the MIT-licensed DSH client primitives (© DeepSeek); see [LICENSE](LICENSE).

---

## 中文

### 安装

从 npm：

```bash
dsh plugin --profile desktop add dsh-whale-balance
```

直接从 GitHub：

```bash
dsh plugin --profile desktop add "git+https://github.com/BugDesigner-Hy/dsh-whale-balance.git"
```

装好后到 **插件** 页确认「余额水杯」已启用。也可以在 **发现 → 添加索引源** 加入社区市场 `https://dshopen.org/index.json`，搜索 whale / 余额 找到它。

### 它在哪里

`shell.overlay` 里的一块 46px 悬浮徽标，默认在窗口右下角（距边 20px），不占布局、不遮挡滚动区域。

- **拖动**：按住徽标可拖到任意位置，松手后记住坐标（窗口缩小时会自动收回可视区）。
- **点击**：只展开面板，不做任何跳转；充值走面板里的「去充值」链接。
- **游动**：鲸鱼以身体为轴微微摆动（约 ±4°），尾巴的摆幅最明显；`prefers-reduced-motion` 下停止。
- **悬停 / 键盘聚焦**：在水杯上方展开面板（靠近窗口顶部时自动翻到下方，靠近左侧时改为左对齐）。
- **面板右上角的齿轮**：切换到设置，改完立即生效并保存；`Esc` 先退出设置、再收起面板。

### 面板内容

| 区域 | 内容 |
| --- | --- |
| 标题行 | 标题 + 齿轮（设置）+ 刷新（读取时旋转） |
| 金额 | 各币种的可用总额（充值 + 赠送）；点某个币种把它设为水位基准 |
| 赠送 | 总额里的赠送部分（>0 才显示） |
| 统计 | 今日消耗、近 7 天消耗、约可用天数 |
| 提醒 | 低于阈值时出现琥珀色提示 |
| 底部 | 「去充值」+ 上次更新时间 |

### 设置（默认值可直接用）

| 设置 | 默认 | 说明 |
| --- | --- | --- |
| 满杯金额 | ¥100（USD 为 $15） | 水位到顶对应的可用总额（充值 + 赠送）。设成 1000，就以 1000 为满杯 |
| 提醒方式 | 金额 | 可选「金额」或「百分比」 |
| 提醒阈值 | ¥5（USD 为 $1） | 低于该金额时水体转琥珀、徽标描边变琥珀并脉冲三次 |
| 百分比阈值 | 10% | 当提醒方式为百分比时，阈值 = 满杯金额 × 该比例 |

满杯金额与金额阈值按币种分别保存（CNY / USD 各一套），百分比是全局一个；`恢复默认` 一次还原全部。设置保存在浏览器 `localStorage`，修改后立即生效，无需重启。

### 水位怎么算

- 水位：**线性**，`(充值 + 赠送) / 满杯金额`。满杯填 100、可用总额 40 就是四成高；超过满杯金额则封顶为满。
- 低余额：可用总额（充值 + 赠送）低于你设置的金额阈值，或低于满杯金额的百分比，即触发提醒。
- 「可用天数」用观察到的近 7 天消耗外推日均（历史不足 7 天按已观察天数等比外推，不足 1 天则不显示），分子是「充值 + 赠送」的可用总额，只是趋势参考。
- 消耗完全来自本插件观察到的余额变化（只在应用运行时记录），是**估算**；把它当作趋势，不要当作账单。统计把「充值余额 + 赠送余额」合在一起算（平台先扣赠送），今日与近 7 天两行始终显示，尚未观察到扣费时显示 ¥0.00 并附一行说明。

### 数据来源

浏览器端读取本应用已挂载的账户 Remote：

```js
ctx.get('remote').$stream({ name: 'account', open: (s) => account.watch(s), ... })  // 实时状态
ctx.get('remote.account').getBalance({ version, locale, timezoneOffsetSeconds })  // 余额
```

即「设置 → 账户」页用的同一条通道。登录、充值、退出都会推一帧，水位随即更新；流不可用时自动退化为每 60 秒轮询，读取失败或服务未就绪时每 5 秒重试，页面隐藏时不发请求、重新可见时立刻刷新。

插件本身不保存 API Key、不发任何外部网络请求。

### 可调常量（`client.js` 顶部）

| 常量 | 默认 | 含义 |
| --- | --- | --- |
| `REFRESH_MS` | `60000` | 轮询回退的刷新间隔 |
| `RETRY_MS` | `5000` | 未就绪/失败时的重试间隔 |
| `FALLBACK_FULL` | `{ CNY: 100, USD: 15 }` | 各币种满杯金额的默认值 |
| `FLOOR_LOW` | `{ CNY: 5, USD: 1 }` | 各币种金额阈值的默认值 |
| `DEFAULT_PERCENT` | `10` | 百分比阈值的默认值 |
| `DAY_MS` | `86400000` | 统计窗口单位 |
| `WATER` / `WATER_LOW` | 蓝 / 琥珀 | 水体与水面高光配色 |

### 主题与可访问性

- 容器、文字、边框只用 `--dsw-alias-*` 主题变量，跟随明暗主题；只有水体是美术配色。
- 徽标是真正的 `<button>`：可聚焦、有含金额与低余额提示的 `aria-label`；面板关闭时用 `visibility` 隐藏，不会进入 Tab 顺序。
- 数字输入框在失焦或回车时才提交，允许中途清空；`Esc` 在输入框内只还原输入，不关闭面板。
- 面板不挡鼠标：只有打开时才接收指针事件，并有一段透明桥接区域，鼠标从徽标移进面板不会闪断。
- 尊重 `prefers-reduced-motion`：关闭波纹漂移、水位过渡、低余额脉冲和刷新旋转。
- 文案走客户端 locale 服务（内置 en / zh）。

### 已知限制

- 消耗统计与设置存放在浏览器 `localStorage`（按 origin）。如果桌面端每次启动换端口，这些数据会重新积累。
- 「可用天数」依赖已观察到的消耗，长时间不用时消耗为 0，该项不显示。

### 文件

| 文件 | 作用 |
| --- | --- |
| `index.js` | Host 半侧：空座位，不注册任何资源 |
| `client.js` | 浏览器半侧：水位徽标、拖动、面板、设置、余额与消耗统计 |
| `cordis.patch.yml` | 插入 `balance-vessel` 这一行 |
| `locale/en.json`、`locale/zh.json` | 插件管理器里的标题与说明 |
| `icon.svg` | 原创图标（水面与鲸尾），非官方商标素材 |
| `LICENSE` | MIT |

鲸鱼轮廓路径取自本应用自带的品牌标志（`@deepseek-ai/dsh-client-ui-primitives`，MIT，© DeepSeek），其余图形与动效为原创。

### 许可证

[MIT](LICENSE) © 2026 BugDesigner-Hy。仓库里的鲸鱼路径来自同样以 MIT 分发的 DSH 客户端素材，署名见 LICENSE。
