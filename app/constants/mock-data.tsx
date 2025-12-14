import { Gift, Calendar, Feather, Heart, Edit3, Star } from 'lucide-react';
import type { ReactNode } from 'react';

export interface Tool {
  id: number;
  title: string;
  desc: string;
  icon: ReactNode;
  tag: string;
}

export interface Scenario {
  id: number;
  title: string;
  color: string;
}

export interface UserLink {
  id: number;
  title: string;
  type: string;
  visits: number;
  date: string;
}

export const TOOLS_DATA: Tool[] = [
  { id: 1, title: "浪漫贺卡", desc: "定制专属的电子心意", icon: <Gift className="w-6 h-6 text-rose-400"/>, tag: "热门" },
  { id: 2, title: "纪念日日历", desc: "铭记每一个心动瞬间", icon: <Calendar className="w-6 h-6 text-purple-400"/>, tag: "实用" },
  { id: 3, title: "情书生成器", desc: "AI 帮你写出动人情话", icon: <Feather className="w-6 h-6 text-pink-400"/>, tag: "AI" },
  { id: 4, title: "表白语录", desc: "不仅是喜欢，更是深爱", icon: <Heart className="w-6 h-6 text-red-400"/>, tag: "灵感" },
  { id: 5, title: "恋爱手账", desc: "记录点滴甜蜜日常", icon: <Edit3 className="w-6 h-6 text-yellow-400"/>, tag: "记录" },
  { id: 6, title: "星空投影", desc: "送 Ta 一片专属星空", icon: <Star className="w-6 h-6 text-indigo-400"/>, tag: "特效" },
];

export const SCENARIOS_DATA: Scenario[] = [
  { id: 1, title: "情人节", color: "bg-rose-100 text-rose-600" },
  { id: 2, title: "生日惊喜", color: "bg-yellow-100 text-yellow-600" },
  { id: 3, title: "纪念日", color: "bg-purple-100 text-purple-600" },
  { id: 4, title: "日常表白", color: "bg-pink-100 text-pink-600" },
];

export const USER_LINKS_DATA: UserLink[] = [
  { id: 1, title: "给小猪的生日贺卡", type: "贺卡", visits: 128, date: "2023-10-15" },
  { id: 2, title: "我们需要记住的日子", type: "日历", visits: 342, date: "2023-09-20" },
  { id: 3, title: "致未来的我们", type: "情书", visits: 56, date: "2023-08-11" },
];
