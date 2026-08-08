"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

type Stage = "未开始" | "统计中" | "统计已结束" | "投放已结束";
type ActivityStatus = "有效" | "无效";

type ActivityConfig = {
  id: number;
  name: string;
  city: string;
  status: ActivityStatus;
  stage: Stage;
  delivery: string;
  statistics: string;
  updater: string;
  updatedAt: string;
};

type RewardRule = {
  id: number;
  from: number;
  to: number;
  normal: boolean;
  normalName: string;
  code: string;
  cash: boolean;
  amount: number;
};

type RewardDetail = {
  id: number;
  type: "普通奖品" | "现金奖品";
  content: string;
  claimStatus: "领取成功" | "领取失败" | "补发中";
  couponNo: string;
  paymentStatus?: "待打款" | "打款中" | "打款成功" | "打款失败";
};

const initialConfigs: ActivityConfig[] = [
  {
    id: 1,
    name: "盛夏真车主里程挑战赛",
    city: "杭州市",
    status: "有效",
    stage: "统计中",
    delivery: "2026-08-01 00:00:00 — 2026-08-31 23:59:59",
    statistics: "2026-08-05 00:00:00 — 2026-08-25 23:59:59",
    updater: "林晓",
    updatedAt: "2026-07-28 16:42:10",
  },
  {
    id: 2,
    name: "申城真车主公里榜",
    city: "上海市",
    status: "有效",
    stage: "统计已结束",
    delivery: "2026-07-01 00:00:00 — 2026-08-15 23:59:59",
    statistics: "2026-07-05 00:00:00 — 2026-07-31 23:59:59",
    updater: "周宁",
    updatedAt: "2026-06-29 10:18:32",
  },
  {
    id: 3,
    name: "蓉城金秋里程赛",
    city: "成都市",
    status: "有效",
    stage: "未开始",
    delivery: "2026-09-01 00:00:00 — 2026-09-30 23:59:59",
    statistics: "2026-09-05 00:00:00 — 2026-09-25 23:59:59",
    updater: "赵航",
    updatedAt: "2026-08-08 14:06:25",
  },
  {
    id: 4,
    name: "鹏城真车主里程季",
    city: "深圳市",
    status: "无效",
    stage: "未开始",
    delivery: "2026-10-01 00:00:00 — 2026-10-31 23:59:59",
    statistics: "2026-10-08 00:00:00 — 2026-10-28 23:59:59",
    updater: "吴越",
    updatedAt: "2026-08-07 09:21:09",
  },
];

const drivers = [
  { rank: 1, mid: "126833921", phone: "**** 6812", city: "杭州市", mileage: "3,286.5", orders: 186, last: "2026-08-09 11:26:18", rewardStatus: "已发放" },
  { rank: 2, mid: "884102376", phone: "**** 0397", city: "杭州市", mileage: "3,102.8", orders: 173, last: "2026-08-09 11:18:45", rewardStatus: "已发放" },
  { rank: 3, mid: "532771904", phone: "**** 5271", city: "杭州市", mileage: "2,984.2", orders: 169, last: "2026-08-09 10:56:33", rewardStatus: "已发放" },
  { rank: 4, mid: "291406835", phone: "**** 9480", city: "杭州市", mileage: "2,801.6", orders: 157, last: "2026-08-09 10:42:16", rewardStatus: "已发放" },
  { rank: 5, mid: "733905214", phone: "**** 1208", city: "杭州市", mileage: "2,677.9", orders: 151, last: "2026-08-09 10:11:09", rewardStatus: "未发放" },
  { rank: 6, mid: "408126753", phone: "**** 7734", city: "杭州市", mileage: "2,591.3", orders: 148, last: "2026-08-09 09:58:22", rewardStatus: "未发放" },
];

const driverRewards: Record<string, RewardDetail[]> = {
  "126833921": [
    { id: 1, type: "普通奖品", content: "华为运动手表", claimStatus: "领取成功", couponNo: "CPN202608126833921" },
    { id: 2, type: "现金奖品", content: "500元", claimStatus: "领取成功", couponNo: "—", paymentStatus: "打款成功" },
  ],
  "884102376": [
    { id: 3, type: "现金奖品", content: "300元", claimStatus: "领取成功", couponNo: "—", paymentStatus: "打款中" },
  ],
  "532771904": [
    { id: 4, type: "普通奖品", content: "200元加油卡", claimStatus: "领取失败", couponNo: "—" },
  ],
  "291406835": [
    { id: 5, type: "现金奖品", content: "100元", claimStatus: "领取成功", couponNo: "—", paymentStatus: "打款失败" },
  ],
};

const orderDetails = [
  { no: "DD2026080900186271", time: "2026-08-09 11:26:18", city: "杭州市", km: "18.6", counted: "2026-08-09 11:26:20" },
  { no: "DD2026080900163518", time: "2026-08-09 10:42:07", city: "杭州市", km: "24.1", counted: "2026-08-09 10:42:09" },
  { no: "DD2026080900139066", time: "2026-08-09 09:51:34", city: "杭州市", km: "16.8", counted: "2026-08-09 09:51:36" },
  { no: "DD2026080800927185", time: "2026-08-08 22:18:45", city: "杭州市", km: "31.5", counted: "2026-08-08 22:18:48" },
];

function Icon({ children }: { children: ReactNode }) {
  return <span className="nav-icon" aria-hidden="true">{children}</span>;
}

function StatusTag({ value }: { value: string }) {
  const cls = value.includes("失败") || value === "无效"
    ? "danger"
    : value.includes("统计中") || value.includes("发放中")
      ? "running"
      : value.includes("成功") || value === "有效" || value === "已发放"
        ? "success"
        : "neutral";
  return <span className={`tag ${cls}`}><i />{value}</span>;
}

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{required && <b>*</b>}{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" className={`switch ${checked ? "on" : ""}`} onClick={() => !disabled && onChange(!checked)} disabled={disabled} aria-pressed={checked}>
      <span />
    </button>
  );
}

function ConfigEditor({ mode, current, onClose, onSave }: {
  mode: "new" | "edit" | "view";
  current?: ActivityConfig;
  onClose: () => void;
  onSave: (config: ActivityConfig) => void;
}) {
  const readOnly = mode === "view";
  const [name, setName] = useState(current?.name ?? "");
  const [city, setCity] = useState(current?.city ?? "杭州市");
  const [status, setStatus] = useState<ActivityStatus>(current?.status ?? "有效");
  const [deliveryStart, setDeliveryStart] = useState("2026-09-01T00:00");
  const [deliveryEnd, setDeliveryEnd] = useState("2026-09-30T23:59");
  const [statsStart, setStatsStart] = useState("2026-09-05T00:00");
  const [statsEnd, setStatsEnd] = useState("2026-09-25T23:59");
  const [audiences, setAudiences] = useState({ xianzhi: true, volume: false, tag: true, ab: true });
  const [orderLimit, setOrderLimit] = useState(true);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [rules, setRules] = useState<RewardRule[]>([
    { id: 1, from: 1, to: 1, normal: true, normalName: "华为运动手表", code: "ACT202609WATCH", cash: true, amount: 500 },
    { id: 2, from: 2, to: 3, normal: false, normalName: "", code: "", cash: true, amount: 300 },
  ]);

  const updateRule = (id: number, key: keyof RewardRule, value: string | number | boolean) => {
    setRules((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: current?.id ?? Date.now(),
      name,
      city,
      status,
      stage: current?.stage ?? "未开始",
      delivery: `${deliveryStart.replace("T", " ")}:00 — ${deliveryEnd.replace("T", " ")}:00`,
      statistics: `${statsStart.replace("T", " ")}:00 — ${statsEnd.replace("T", " ")}:00`,
      updater: "当前用户",
      updatedAt: "2026-08-09 14:30:00",
    });
  };

  return (
    <div className="page-layer">
      <div className="editor-header">
        <div>
          <button className="back-button" type="button" onClick={onClose}>←</button>
          <div>
            <span className="eyebrow">活动配置</span>
            <h2>{mode === "new" ? "新增活动配置" : mode === "edit" ? "编辑活动配置" : "查看活动配置"}</h2>
          </div>
        </div>
        <span className="editor-note">一个活动配置对应一个城市</span>
      </div>

      <form className="editor-form" onSubmit={submit}>
        <section className="form-section">
          <div className="section-head"><span>01</span><div><h3>基础信息</h3><p>配置活动城市、投放时间与订单统计周期</p></div></div>
          <div className="form-grid two">
            <Field label="活动名称" required hint={`${name.length}/20`}>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} placeholder="请输入活动名称" disabled={readOnly} required />
            </Field>
            <Field label="活动状态" required>
              <div className="radio-row">
                {(["有效", "无效"] as ActivityStatus[]).map((item) => <label key={item}><input type="radio" checked={status === item} onChange={() => setStatus(item)} disabled={readOnly} />{item}</label>)}
              </div>
            </Field>
            <Field label="城市限制" required>
              <select value={city} onChange={(e) => setCity(e.target.value)} disabled={readOnly}>
                {['杭州市', '上海市', '成都市', '深圳市', '南京市'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <div className="field info-box"><span>城市编码</span><strong>{city === "杭州市" ? "330100" : city === "上海市" ? "310000" : "系统自动带出"}</strong><small>保存城市编码，绑定后不可修改</small></div>
            <Field label="活动投放时间" required>
              <div className="date-range"><input type="datetime-local" value={deliveryStart} onChange={(e) => setDeliveryStart(e.target.value)} disabled={readOnly} /><em>至</em><input type="datetime-local" value={deliveryEnd} onChange={(e) => setDeliveryEnd(e.target.value)} disabled={readOnly} /></div>
            </Field>
            <Field label="订单统计时间" required hint="统计时间必须完整落在活动投放时间内">
              <div className="date-range"><input type="datetime-local" value={statsStart} onChange={(e) => setStatsStart(e.target.value)} disabled={readOnly} /><em>至</em><input type="datetime-local" value={statsEnd} onChange={(e) => setStatsEnd(e.target.value)} disabled={readOnly} /></div>
            </Field>
          </div>
        </section>

        <section className="form-section">
          <div className="section-head"><span>02</span><div><h3>参与人群限制</h3><p>未启用任何限制表示不限制参与人群，多项限制同时启用时取交集</p></div></div>
          <div className="condition-list">
            <div className="condition-item">
              <div className="condition-title"><Switch checked={audiences.xianzhi} disabled={readOnly} onChange={(v) => setAudiences({ ...audiences, xianzhi: v })} /><div><strong>先知人群限制</strong><span>通过先知场景与标签限定可参与司机</span></div></div>
              {audiences.xianzhi && <div className="condition-fields"><Field label="先知场景" required><select disabled={readOnly}><option>真车主活动人群</option><option>司机精细化运营</option></select></Field><Field label="先知人群标签" required><div className="multi-select"><span>高活跃真车主 ×</span><span>里程潜力司机 ×</span></div></Field></div>}
            </div>
            <div className="condition-item">
              <div className="condition-title"><Switch checked={audiences.volume} disabled={readOnly} onChange={(v) => setAudiences({ ...audiences, volume: v })} /><div><strong>司机完单量限制</strong><span>配置司机完单量阈值，大于等于阈值时满足限制</span></div></div>
              {audiences.volume && <div className="condition-fields one"><Field label="司机完单量阈值" required hint="司机完单量大于等于该阈值时满足限制"><div className="unit-input"><input type="number" min="0" step="1" defaultValue={30} disabled={readOnly} /><span>单</span></div></Field></div>}
            </div>
            <div className="condition-item">
              <div className="condition-title"><Switch checked={audiences.tag} disabled={readOnly} onChange={(v) => setAudiences({ ...audiences, tag: v })} /><div><strong>司机标签限制</strong><span>命中任一已选标签即满足本项限制</span></div></div>
              {audiences.tag && <div className="condition-fields one"><Field label="司机标签" required><div className="multi-select"><span>真车主 ×</span><span>服务分90以上 ×</span></div></Field></div>}
            </div>
            <div className="condition-item">
              <div className="condition-title"><Switch checked={audiences.ab} disabled={readOnly} onChange={(v) => setAudiences({ ...audiences, ab: v })} /><div><strong>AB实验限制</strong><span>仅指定实验分组的司机可以参与</span></div></div>
              {audiences.ab && <div className="condition-fields"><Field label="实验号" required><div className="button-input"><input defaultValue="EXP_TRUE_OWNER_2026" disabled={readOnly} /><button type="button" onClick={() => setGroupsLoaded(true)} disabled={readOnly}>{groupsLoaded ? "已获取" : "获取分组"}</button></div></Field><Field label="指定实验分组" required><select disabled={readOnly || !groupsLoaded}><option>{groupsLoaded ? "B组 · 活动实验组" : "请先获取实验分组"}</option></select></Field></div>}
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-head"><span>03</span><div><h3>订单限制条件</h3><p>每笔完单累计里程前均校验订单条件</p></div><Switch checked={orderLimit} disabled={readOnly} onChange={setOrderLimit} /></div>
          {orderLimit && <div className="rules-builder"><div className="rule-row"><span>条件 1</span><select disabled={readOnly}><option>订单业务类型</option></select><select disabled={readOnly}><option>等于</option></select><div className="multi-select"><span>快车 ×</span><span>特惠快车 ×</span></div><button type="button" disabled={readOnly}>删除</button></div><div className="rule-relation">且</div><div className="rule-row"><span>条件 2</span><select disabled={readOnly}><option>订单金额</option></select><select disabled={readOnly}><option>大于等于</option></select><input type="number" defaultValue={20} disabled={readOnly} /><button type="button" disabled={readOnly}>删除</button></div><button type="button" className="text-add" disabled={readOnly}>＋ 添加限制条件</button></div>}
        </section>

        <section className="form-section rewards-section">
          <div className="section-head"><span>04</span><div><h3>名次奖励配置</h3><p>名次区间不可重叠，进入配置名次即获奖</p></div>{!readOnly && <button className="secondary" type="button" onClick={() => setRules([...rules, { id: Date.now(), from: rules.length + 2, to: rules.length + 2, normal: false, normalName: "", code: "", cash: true, amount: 100 }])}>＋ 新增名次奖励</button>}</div>
          <div className="reward-list">
            {rules.map((rule, index) => <div className="reward-card" key={rule.id}>
              <div className="reward-card-head"><strong>奖励规则 {index + 1}</strong>{rules.length > 1 && !readOnly && <button type="button" onClick={() => setRules(rules.filter((item) => item.id !== rule.id))}>删除</button>}</div>
              <div className="rank-row"><Field label="获奖名次" required><div className="rank-range"><input type="number" min="1" value={rule.from} onChange={(e) => updateRule(rule.id, "from", Number(e.target.value))} disabled={readOnly} /><em>至</em><input type="number" min="1" value={rule.to} onChange={(e) => updateRule(rule.id, "to", Number(e.target.value))} disabled={readOnly} /><i>名</i></div></Field></div>
              <div className="reward-types">
                <div className={`reward-type ${rule.normal ? "selected" : ""}`}><div className="reward-type-title"><label><input type="checkbox" checked={rule.normal} onChange={(e) => updateRule(rule.id, "normal", e.target.checked)} disabled={readOnly} />普通奖品</label><span>通过营销活动Code发放</span></div>{rule.normal && <div className="reward-fields"><Field label="奖品名称" required><input value={rule.normalName} onChange={(e) => updateRule(rule.id, "normalName", e.target.value)} disabled={readOnly} /></Field><Field label="奖品发放活动Code" required><input value={rule.code} onChange={(e) => updateRule(rule.id, "code", e.target.value)} disabled={readOnly} /></Field></div>}</div>
                <div className={`reward-type ${rule.cash ? "selected" : ""}`}><div className="reward-type-title"><label><input type="checkbox" checked={rule.cash} onChange={(e) => updateRule(rule.id, "cash", e.target.checked)} disabled={readOnly} />现金奖品</label><span>按配置的固定金额打款</span></div>{rule.cash && <div className="reward-fields one"><Field label="现金奖励金额" required><div className="unit-input"><input type="number" min="1" step="1" value={rule.amount} onChange={(e) => updateRule(rule.id, "amount", Number(e.target.value))} disabled={readOnly} /><span>元</span></div></Field></div>}</div>
              </div>
            </div>)}
          </div>
        </section>

        <div className="sticky-actions"><button className="secondary" type="button" onClick={onClose}>{readOnly ? "返回" : "取消"}</button>{!readOnly && <button className="primary" type="submit">保存配置</button>}</div>
      </form>
    </div>
  );
}

function ConfigList({ configs, onOpen }: { configs: ActivityConfig[]; onOpen: (mode: "new" | "edit" | "view", item?: ActivityConfig) => void }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState({ name: "", status: "" });
  const rows = useMemo(() => configs.filter((item) => (!query.name || item.name.includes(query.name)) && (!query.status || item.status === query.status)), [configs, query]);
  const reset = () => { setName(""); setStatus(""); };

  return <>
    <div className="content-heading"><div><span className="eyebrow">活动运营</span><h1>活动配置管理</h1><p>按城市维护真车主里程排行榜活动及奖励规则</p></div><button className="primary" onClick={() => onOpen("new")}>＋ 新增配置</button></div>
    <section className="panel filter-panel">
      <div className="filter-grid">
        <Field label="活动名称"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入活动名称" /></Field>
        <Field label="活动状态"><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">全部状态</option><option>有效</option><option>无效</option></select></Field>
      </div>
      <div className="filter-actions"><button className="secondary" onClick={reset}>重置</button><button className="primary" onClick={() => setQuery({ name, status })}>查询</button></div>
    </section>
    <section className="panel table-panel">
      <div className="panel-title"><div><h3>配置列表</h3><span>共 {rows.length} 条配置</span></div><button className="icon-button" title="刷新">↻</button></div>
      <div className="table-wrap"><table><thead><tr><th>序号</th><th>活动名称 / 城市</th><th>活动状态</th><th>活动投放时间</th><th>订单统计时间</th><th>更新信息</th><th className="right">操作</th></tr></thead><tbody>{rows.map((item, index) => <tr key={item.id}><td className="muted">{String(index + 1).padStart(2, "0")}</td><td><button className="table-main" onClick={() => onOpen("view", item)}>{item.name}</button><span className="subline"><b>⌖</b>{item.city}</span></td><td><StatusTag value={item.status} /></td><td className="time-cell">{item.delivery.split(" — ").map((t) => <span key={t}>{t}</span>)}</td><td className="time-cell">{item.statistics.split(" — ").map((t) => <span key={t}>{t}</span>)}</td><td><span>{item.updater}</span><small>{item.updatedAt}</small></td><td className="right actions"><button onClick={() => onOpen("view", item)}>查看</button><button disabled={item.stage !== "未开始"} onClick={() => onOpen("edit", item)}>编辑</button></td></tr>)}</tbody></table></div>
      <div className="pagination"><span>共 {rows.length} 条</span><select defaultValue="20"><option>10 条/页</option><option>20 条/页</option><option>50 条/页</option></select><button disabled>‹</button><button className="active">1</button><button disabled>›</button></div>
    </section>
  </>;
}

function DataPage({ onDetail }: { onDetail: (mid: string) => void }) {
  return <>
    <div className="content-heading"><div><span className="eyebrow">活动运营</span><h1>活动数据</h1><p>查看司机累计里程、订单明细与奖励信息</p></div><div className="live-pill"><i /> 实时数据</div></div>
    <section className="panel filter-panel data-filter">
      <div className="filter-grid">
        <Field label="活动名称" required><select defaultValue="盛夏真车主里程挑战赛"><option>盛夏真车主里程挑战赛</option><option>申城真车主公里榜</option><option>蓉城金秋里程赛</option></select></Field>
        <Field label="mid"><input placeholder="请输入mid" /></Field>
        <Field label="手机号后四位"><input maxLength={4} placeholder="请输入4位数字" /></Field>
      </div><div className="filter-actions"><button className="secondary">重置</button><button className="primary">查询</button></div>
    </section>
    <section className="panel table-panel"><div className="panel-title"><div><h3>司机里程排行榜</h3><span>当前展示：杭州市</span></div><span className="rank-note">里程越高排名越靠前</span></div><div className="table-wrap"><table><thead><tr><th>名次</th><th>mid / 手机号</th><th>归属城市</th><th>累计公里数</th><th>计入订单数</th><th>奖励状态</th><th>最近计入时间</th><th className="right">操作</th></tr></thead><tbody>{drivers.map((item) => <tr key={item.mid}><td><span className={`rank-badge r${item.rank}`}>{item.rank}</span></td><td><strong>{item.mid}</strong><span className="subline">{item.phone}</span></td><td>{item.city}</td><td><strong className="mileage">{item.mileage}</strong><span className="unit"> km</span></td><td>{item.orders} 单</td><td><StatusTag value={item.rewardStatus} /></td><td>{item.last}</td><td className="right actions"><button onClick={() => onDetail(item.mid)}>查看明细</button></td></tr>)}</tbody></table></div><div className="pagination"><span>共 2,486 条</span><select><option>20 条/页</option></select><button>‹</button><button className="active">1</button><button>2</button><button>3</button><button>›</button></div></section>
  </>;
}

function OrderDrawer({ mid, onClose }: { mid: string; onClose: () => void }) {
  const driver = drivers.find((item) => item.mid === mid) ?? drivers[0];
  const [rewardItems, setRewardItems] = useState<RewardDetail[]>(driverRewards[mid] ?? []);
  const reissue = (id: number) => setRewardItems((items) => items.map((item) => item.id === id ? { ...item, claimStatus: "补发中" } : item));

  return <div className="drawer-mask" onMouseDown={onClose}><aside className="drawer" onMouseDown={(e) => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">司机里程与奖励明细</span><h2>司机 {mid}</h2></div><button onClick={onClose}>×</button></div><div className="driver-summary"><div><span>归属城市</span><strong>{driver.city}</strong></div><div><span>累计公里数</span><strong>{driver.mileage} km</strong></div><div><span>当前名次</span><strong>第 {driver.rank} 名</strong></div><div><span>奖励状态</span><StatusTag value={driver.rewardStatus} /></div></div>{driver.rewardStatus === "已发放" && <div className="drawer-table reward-detail-table"><div className="panel-title"><div><h3>奖品信息</h3><span>普通奖品与现金奖品分别展示</span></div></div><table><thead><tr><th>奖品类型</th><th>奖励内容</th><th>领取状态</th><th>券号</th><th>打款状态</th><th className="right">操作</th></tr></thead><tbody>{rewardItems.map((item) => <tr key={item.id}><td><span className={`reward-label ${item.type === "现金奖品" ? "cash" : "normal"}`}>{item.type}</span></td><td><strong>{item.content}</strong></td><td><StatusTag value={item.claimStatus} /></td><td>{item.couponNo}</td><td>{item.type === "现金奖品" ? <StatusTag value={item.paymentStatus ?? "待打款"} /> : "—"}</td><td className="right actions">{item.claimStatus === "领取失败" ? <button onClick={() => reissue(item.id)}>补发</button> : item.claimStatus === "补发中" ? <button disabled>补发中</button> : "—"}</td></tr>)}</tbody></table></div>}<div className="drawer-table order-detail-table"><div className="panel-title"><div><h3>计入订单</h3><span>共 {driver.orders} 单</span></div></div><table><thead><tr><th>订单号 / 完单时间</th><th>出发城市</th><th>订单公里数</th><th>计入时间</th></tr></thead><tbody>{orderDetails.map((item) => <tr key={item.no}><td><strong>{item.no}</strong><small>{item.time}</small></td><td>{item.city}</td><td><strong className="mileage">{item.km}</strong> km</td><td>{item.counted}</td></tr>)}</tbody></table></div><div className="drawer-foot"><span>明细里程合计与司机累计公里数保持一致</span><button className="primary" onClick={onClose}>关闭</button></div></aside></div>;
}

export default function Home() {
  const [nav, setNav] = useState<"config" | "data">("config");
  const [configs, setConfigs] = useState(initialConfigs);
  const [editor, setEditor] = useState<{ mode: "new" | "edit" | "view"; item?: ActivityConfig } | null>(null);
  const [detailMid, setDetailMid] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const saveConfig = (item: ActivityConfig) => {
    setConfigs((items) => items.some((old) => old.id === item.id) ? items.map((old) => old.id === item.id ? item : old) : [item, ...items]);
    setEditor(null);
    setToast("活动配置保存成功");
    window.setTimeout(() => setToast(""), 2400);
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span>里</span></div><div><strong>出行营销</strong><small>活动运营中心</small></div></div>
      <nav><span className="nav-section">活动管理</span><button className={nav === "config" ? "active" : ""} onClick={() => { setNav("config"); setEditor(null); }}><Icon>▦</Icon><span>配置管理</span></button><button className={nav === "data" ? "active" : ""} onClick={() => { setNav("data"); setEditor(null); }}><Icon>⌁</Icon><span>活动数据</span></button></nav>
      <div className="sidebar-help"><span>?</span><div><strong>需要帮助？</strong><small>查看活动配置规范</small></div></div>
    </aside>
    <main>
      <header className="topbar"><div className="breadcrumb"><span>真车主运营</span><b>/</b><strong>{nav === "config" ? "配置管理" : "活动数据"}</strong></div><div className="top-actions"><button title="通知">●</button><div className="user"><span>林</span><div><strong>林晓</strong><small>活动运营</small></div><b>⌄</b></div></div></header>
      <div className="content">{editor ? <ConfigEditor mode={editor.mode} current={editor.item} onClose={() => setEditor(null)} onSave={saveConfig} /> : nav === "config" ? <ConfigList configs={configs} onOpen={(mode, item) => setEditor({ mode, item })} /> : <DataPage onDetail={setDetailMid} />}</div>
    </main>
    {detailMid && <OrderDrawer mid={detailMid} onClose={() => setDetailMid(null)} />}
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>;
}
