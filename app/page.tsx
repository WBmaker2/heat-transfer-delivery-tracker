import type { Metadata } from "next";
import { TrackerApp } from "../src/app/TrackerApp";

export const metadata: Metadata = {
  title: "열 이동 배달 추적소 | 온도표로 열 이동 알아보기",
  description: "초등 5~6학년을 위한 열 이동 학습 웹앱입니다.",
};

export default function Home() {
  return <TrackerApp />;
}
