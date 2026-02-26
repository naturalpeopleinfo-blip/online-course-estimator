"use client";

import { useMemo, useState } from "react";

type PlanKey = "A" | "B" | "C";
type LengthKey = "15" | "30" | "45";
type OptionKey = "timer" | "shorts" | "promo60";
type RevisionKey = 2 | 3 | 4 | 5;

function yen(n: number) {
  return "¥" + new Intl.NumberFormat("ja-JP").format(n);
}

const LENGTHS: { key: LengthKey; label: string }[] = [
  { key: "15", label: "〜15分" },
  { key: "30", label: "〜30分" },
  { key: "45", label: "〜45分" },
];

type PlanDef = {
  title: string;
  badge: string;
  suitableFor: string;
  overview: string;
  descriptionItems: string[];
  prices: Record<LengthKey, number>;
  embedUrl?: string; // ← 後でYouTube/Vimeo埋め込み用URLを入れる
};

const PLANS: Record<PlanKey, PlanDef> = {
  A: {
    title: "Aプラン｜はじめて安心（1カメ＋簡易テロップ）",
    badge: "まずはこれでOK",
    suitableFor: "初めてオンライン講座を作る／まずは最小構成で始めたい",
    overview: "正面カメラ1台で全身を安定して撮影し、タイトル／章タイトルだけの“簡易テロップ”でスッキリ仕上げます（最小構成で分かりやすい講座に）。",
    descriptionItems: [
      "撮影：正面カメラ1台（正面から全身が映る）",
      "編集：不要カット（いらない部分を編集でカットする）",
      "編集：整音（雑音を整えて、聞き取りやすくする）",
      "編集：色調調整（色を整えて、見やすくする）",
      "テロップ：簡易テロップ（タイトル／章タイトルだけ表示）",
    ],
    prices: { "15": 60000, "30": 100000, "45": 130000 },
    embedUrl: "https://www.youtube.com/embed/bNWQ_a-5u7k",
  },
  B: {
    title: "Bプラン｜フォームが伝わる（2カメ＋要点テロップ）",
    badge: "説得力アップ",
    suitableFor: "フォームの見え方を重視したい／要点がパッと伝わる動画にしたい",
    overview: "正面＋斜めの2カメで“動きの分かりやすさ”を強化。章タイトル＋重要ポイントの要点テロップで、見返しやすい講座映像にします。",
    descriptionItems: [
      "撮影：2カメ（正面＋斜めの2台でフォームが分かる）",
      "編集：マルチカメラ編集（2台の映像を切り替える）",
      "編集：不要カット（いらない部分を編集でカットする）",
      "編集：整音（雑音を整えて、聞き取りやすくする）",
      "編集：色調調整（色を整えて、見やすくする）",
      "テロップ：要点テロップ（章タイトル＋重要ポイントを表示）",
    ],
    prices: { "15": 95000, "30": 150000, "45": 195000 },
    embedUrl: "https://www.youtube.com/embed/7ICvE1iFX8s",
  },
  C: {
    title: "Cプラン｜講座クオリティ（2カメ＋フルテロップ）",
    badge: "完成度MAX",
    suitableFor: "講座としての完成度を最優先／初見でも迷わずできる構成にしたい",
    overview: "2カメで分かりやすさを最大化しつつ、話す内容をほぼ全てテロップ化。音無し視聴でも理解しやすい“講座クオリティ”で仕上げます。",
    descriptionItems: [
      "撮影：2カメ（正面＋斜めの2台でフォームが分かる）",
      "編集：マルチカメラ編集（2台の映像を切り替える）",
      "編集：不要カット（いらない部分を編集でカットする）",
      "編集：整音（雑音を整えて、聞き取りやすくする）",
      "編集：色調調整（色を整えて、見やすくする）",
      "テロップ：要点テロップ（章タイトル＋重要ポイントを表示）",
      "テロップ：フルテロップ（話す内容をほぼ全部テロップ化）",
      "演出：オープニングアニメーション（ロゴ＋タイトルで講座の世界観を整える）",
    ],
    prices: { "15": 120000, "30": 205000, "45": 285000 },
    embedUrl: "https://www.youtube.com/embed/O2WC_lw7wi4",
  },
};

const OPTIONS = [
  {
    key: "timer" as OptionKey,
    name: "タイマー表示",
    price: 10000,
    desc: "エクササイズ時間を表示し、視聴者が安心して取り組めるようにする",
  },
  {
    key: "shorts" as OptionKey,
    name: "SNS用ショート動画3本制作",
    price: 20000,
    desc: "講座の一部を切り出し、Instagramや告知用に活用できる",
  },
  {
    key: "promo60" as OptionKey,
    name: "講座紹介動画（60秒）制作",
    price: 20000,
    desc: "講座の魅力を1分にまとめ、販売ページやSNSで使える",
  },
];

const BREAKDOWN_EXAMPLE_15 = [
  { label: "打ち合わせ（オンライン60分）", price: 3000 },
  { label: "撮影費（2時間）", price: 25000 },
  { label: "撮影機材費（シネマカメラ／各種レンズ使用）", price: 10000 },
  { label: "照明設営・ライティング調整", price: 5000 },
  { label: "音声収録・レベル管理", price: 5000 },
  { label: "編集費（構成設計・カット編集）", price: 10000 },
  { label: "カラー調整・整音仕上げ", price: 2000 },
] as const;

function SectionCard({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-600 px-3 py-1 text-sm text-white">
            {step}
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function VideoEmbed({ url }: { url?: string }) {
  if (!url) {
    return (
      <div className="mt-4 border border-dashed border-neutral-300 p-4 rounded-xl text-sm text-neutral-500">
        ここに参考動画（YouTube/Vimeo埋め込み）が表示されます
      </div>
    );
  }

  return (
    <div className="mt-4 aspect-video w-full rounded-xl overflow-hidden border border-neutral-200">
      <iframe
        src={url}
        className="w-full h-full"
        allowFullScreen
      />
    </div>
  );
}

export default function PricingApp() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("A");
  const [selectedLength, setSelectedLength] = useState<LengthKey>("15");
  const [selectedOptions, setSelectedOptions] = useState<Record<OptionKey, boolean>>({
    timer: false,
    shorts: false,
    promo60: false,
  });

  const currentPlan = PLANS[selectedPlan];
  const basePrice = currentPlan.prices[selectedLength];

  const optionsTotal = OPTIONS.reduce(
    (sum, o) => sum + (selectedOptions[o.key] ? o.price : 0),
    0
  );

  const total = basePrice + optionsTotal;
  const subtotal = total;

  const selectedLengthLabel =
    LENGTHS.find((l) => l.key === selectedLength)?.label;

  const breakdownExampleTotal = BREAKDOWN_EXAMPLE_15.reduce(
    (sum, row) => sum + row.price,
    0
  );

  return (
    <div className="min-h-dvh bg-white text-neutral-900 p-6 pb-28 md:pb-32">
      <div className="mx-auto max-w-3xl space-y-6">

        <h1 className="text-2xl font-semibold">
          鈴木サチ様ピラティスオンライン講座 動画製作費用シミュレーター
        </h1>

        {/* 冒頭説明（やさしめ） */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700 space-y-2">
          <p>
            料金は、撮影だけでなく「照明を立てる」「音をきれいに録る」「見やすく編集する」作業を含めた目安です。
          </p>
          <p className="text-neutral-600">
            企画・構成設計（講座内容の整理／台本／章立て／導線など）から一緒に進める場合は、別途ご相談ください。
          </p>
        </section>

        {/* 概算の内訳例（表示用） */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-base text-neutral-900">
                制作費の考え方（概算例）
              </div>
              <div className="text-neutral-600 mt-1">
                ■ 基本制作費 内訳例（〜15分 / Aプラン想定）
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-xs text-neutral-500">合計</div>
              <div className="text-xl font-bold text-neutral-900">
                {yen(breakdownExampleTotal)}
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {BREAKDOWN_EXAMPLE_15.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-neutral-700">{row.label}</span>
                <span className="font-semibold text-neutral-900">
                  {yen(row.price)}
                </span>
              </li>
            ))}
          </ul>

          <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-200">
            ※ 内訳は「何に費用がかかるか」を分かりやすくするための概算例です。内容・尺・テロップ量・修正状況により増減します。
          </div>
        </section>

        {/* フロー説明 */}
        <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-700 space-y-2">
          <div className="font-semibold text-base text-neutral-900">
            ご利用の流れ
          </div>
          <ol className="list-decimal pl-5 space-y-1">
            <li>プランを選択してください（撮影構成・テロップ内容が変わります）</li>
            <li>完成動画の長さを選択してください</li>
            <li>必要に応じてオプションを追加してください</li>
          </ol>
          <div className="text-neutral-500">
            ※ 下に合計金額が自動で表示されます。
          </div>
        </section>

        {/* 1. プラン */}
        <SectionCard step="1" title="プラン選択">
          <div className="space-y-6" role="radiogroup" aria-label="プラン選択">
            {(Object.keys(PLANS) as PlanKey[]).map((key) => {
              const plan = PLANS[key];
              const active = selectedPlan === key;

              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedPlan(key)}
                  className={`w-full text-left rounded-2xl border transition flex flex-col bg-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                    active
                      ? "border-emerald-600 bg-emerald-50 shadow-md"
                      : "border-neutral-200 hover:bg-neutral-50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-200 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                      <div className="inline-block rounded-full bg-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1">
                        {plan.badge}
                      </div>
                      {active && (
                        <div className="inline-block rounded-full bg-emerald-600 text-white text-xs font-semibold px-3 py-1">
                          選択中
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!active && (
                        <div className="text-xs text-neutral-500">タップして選択</div>
                      )}
                      <div
                        className={`h-6 w-6 rounded-full border flex items-center justify-center transition ${
                          active ? "border-emerald-600 bg-emerald-600" : "border-neutral-300 bg-white"
                        }`}
                        aria-hidden="true"
                      >
                        {active && (
                          <svg
                            viewBox="0 0 20 20"
                            className="h-4 w-4 text-white"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 5.29a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.414 0l-3.2-3.2A1 1 0 016.304 9.29l2.493 2.493 6.493-6.493a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pt-4 pb-2 space-y-2">
                    <div className="font-semibold text-xl">{plan.title}</div>
                    <div className="text-sm text-neutral-600">
                      向いている人: {plan.suitableFor}
                    </div>
                    <div className="text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                      <span className="font-semibold">映像のイメージ（概要）: </span>
                      {plan.overview}
                    </div>

                    <ol className="list-decimal pl-5 mt-3 text-neutral-700 space-y-1 text-sm leading-relaxed">
                      {plan.descriptionItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  </div>

                  {(key === "A" || key === "B" || key === "C") && (
                    <div className="px-5 pt-4 text-sm font-semibold text-neutral-700">
                      {key === "A"
                        ? "Aプラン参考（全身が見やすい1カメ構成のイメージ）"
                        : key === "B"
                        ? "Bプラン参考（2カメ：正面＋斜めのイメージ）"
                        : "Cプラン参考（フルテロップ密度のイメージ）"}
                    </div>
                  )}

                  {key === "A" && (
                    <div className="px-5 text-sm text-neutral-600 leading-relaxed">
                      実際の制作では、冒頭タイトルと章タイトル（小タイトル）を追加して、スッキリ見やすく整えます。
                    </div>
                  )}

                  {key === "B" && (
                    <div className="px-5 text-sm text-neutral-600 leading-relaxed">
                      実際の制作では、章タイトル＋重要ポイントの要点テロップを追加して、復習しやすい講座に仕上げます。
                    </div>
                  )}

                  {key === "C" && (
                    <div className="px-5 text-sm text-neutral-600 leading-relaxed">
                      実際の制作では、話されている内容を整理し、章タイトル・重要ポイント・注意点・フォーム補足までフルテロップ化して表示します。音声なしでも理解できる“学習系講座クオリティ”を目指します。
                    </div>
                  )}

                  <div className="px-5 pb-4">
                    <VideoEmbed url={plan.embedUrl} />
                  </div>

                  <div className="px-5 py-4 border-t border-neutral-200 bg-neutral-50">
                    <div className="text-sm text-neutral-600">
                      {key}プランの金額（{selectedLengthLabel} / 1本）
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">
                      {yen(plan.prices[selectedLength])}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
        <div className="flex flex-col items-center justify-center text-neutral-400 py-4">
          <div className="text-sm font-medium">↓ 次へ</div>
          <div className="text-xs">次のステップを選択してください</div>
        </div>

        {/* 2. 長さ */}
        <SectionCard step="2" title="完成動画の長さ">
          <div className="text-sm text-neutral-600 mb-3 leading-relaxed">
            0〜15分以内、15〜30分以内、30〜45分以内で料金が区分されます。<br />
            それぞれの範囲内であれば、細かい分数による追加料金は発生しません。
          </div>
          <div className="flex gap-3">
            {LENGTHS.map((l) => (
              <button
                key={l.key}
                onClick={() => setSelectedLength(l.key)}
                className={`px-4 py-2 rounded-full border ${
                  selectedLength === l.key
                    ? "bg-emerald-600 text-white"
                    : "border-neutral-200"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </SectionCard>
        <div className="flex flex-col items-center justify-center text-neutral-400 py-4">
          <div className="text-sm font-medium">↓ 次へ</div>
          <div className="text-xs">次のステップを選択してください</div>
        </div>

        {/* 3. オプション */}
        <SectionCard step="3" title="オプション">
          <div className="space-y-3">
            {OPTIONS.map((o) => (
              <label key={o.key} className="flex justify-between border p-4 rounded-xl">
                <div className="pr-3">
                  <div className="font-semibold">{o.name}</div>
                  <div className="text-sm text-neutral-500">{o.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-neutral-800">
                    +{yen(o.price)}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedOptions[o.key]}
                    onChange={(e) =>
                      setSelectedOptions({
                        ...selectedOptions,
                        [o.key]: e.target.checked,
                      })
                    }
                  />
                </div>
              </label>
            ))}
          </div>
        </SectionCard>

        {/* モバイル：簡易内訳（必要最低限） */}
        <section id="breakdown" className="md:hidden rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-base mb-2">内訳（簡易）</h2>
          <div className="text-sm text-neutral-700 space-y-1">
            <div className="flex justify-between gap-3">
              <span className="text-neutral-600">基本料金</span>
              <span className="font-semibold">{yen(basePrice)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-neutral-600">オプション</span>
              <span className="font-semibold">{yen(optionsTotal)}</span>
            </div>
          </div>
        </section>

        {/* 合計（黄色, デスクトップ：画面下に固定） */}
        <div
          id="summary"
          className="hidden md:block fixed bottom-0 left-0 right-0 z-40 border-t border-amber-200 bg-amber-50"
        >
          <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="text-xs text-neutral-600">合計（1本）</div>
              <div className="text-2xl font-bold text-emerald-700 truncate">{yen(total)}</div>
            </div>

            <div className="flex items-center gap-6 text-sm text-neutral-700">
              <div className="text-right">
                <div className="text-xs text-neutral-500">基本料金</div>
                <div className="font-semibold">{yen(basePrice)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-500">オプション</div>
                <div className="font-semibold">{yen(optionsTotal)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* モバイル：合計を画面下に固定（アプリ風） */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-amber-200 bg-amber-50">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-neutral-600">合計（1本）</div>
              <div className="text-lg font-semibold text-emerald-700 truncate">
                {yen(total)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("breakdown");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="shrink-0 rounded-full bg-emerald-600 text-white text-sm font-semibold px-4 py-2"
            >
              内訳を見る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}