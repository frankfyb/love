'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Star, Share2, Edit3, Trash2, Layers, Sparkles, Film, Play, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import ComboCreator from './components/ComboCreator';
import { USER_LINKS_DATA } from '@/constants/mock-data';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ShareContent from '@/components/features/ShareContent';
import UserLinkItem from '@/components/features/UserLinkItem';
import { getToolKeyList, getToolName } from '@/config/toolsRegistry';
import { UserProfile, UserWorkItem, ComboData } from '@/types';
import { getWorks, saveWorks, getCombos, deleteCombo } from '@/services/storage';

const DEFAULT_PROFILE: UserProfile = {
  name: '浪漫制造家',
  bio: '"爱意随风起，风止意难平"',
  avatar: '🌸',
  stats: {
    works: 0,
    visits: '0',
    collections: 0
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isComboOpen, setIsComboOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(DEFAULT_PROFILE);
  const [works, setWorks] = useState<UserWorkItem[]>([]);
  const [shareItem, setShareItem] = useState<UserWorkItem | null>(null);
  const [combos, setCombos] = useState<ComboData[]>([]);
  const [showComboDeleteConfirm, setShowComboDeleteConfirm] = useState<string | null>(null);

  // 分享相关状态
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    // Load Profile
    try {
      const saved = localStorage.getItem('user_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }

    // Load Works
    const toolKeys = getToolKeyList();
    let allWorks: UserWorkItem[] = [];

    toolKeys.forEach(toolKey => {
      const templates = getWorks(toolKey);
      const toolWorks = templates.map((t) => ({
        id: t.id,
        title: t.name,
        toolKey,
        toolName: getToolName(toolKey),
        date: new Date(Number(t.id)).toLocaleDateString(),
        visits: 0, // Mock for now
        config: t.data
      }));
      allWorks = [...allWorks, ...toolWorks];
    });

    // Sort by date desc
    allWorks.sort((a, b) => Number(b.id) - Number(a.id));
    setWorks(allWorks);

    // Load Combos
    setCombos(getCombos());

    // Update stats work count if using default
    setProfile(prev => ({
      ...prev,
      stats: { ...prev.stats, works: allWorks.length }
    }));

  }, []);

  const handleEditClick = () => {
    setEditForm(profile);
    setIsEditOpen(true);
  };

  const handleSaveProfile = () => {
    setProfile(editForm);
    try {
      localStorage.setItem('user_profile', JSON.stringify(editForm));
    } catch (e) { }
    setIsEditOpen(false);
  };

  const handleDeleteWork = () => {
    if (!showDeleteConfirm) return;

    const target = works.find(w => w.id === showDeleteConfirm);
    if (target) {
      try {
        // Update LocalStorage
        const templates = getWorks(target.toolKey);
        const newTemplates = templates.filter(t => t.id !== target.id);
        saveWorks(target.toolKey, newTemplates);

        // Update State
        const newWorks = works.filter(w => w.id !== target.id);
        setWorks(newWorks);
        setProfile(prev => ({ ...prev, stats: { ...prev.stats, works: newWorks.length } }));
      } catch (e) {
        console.error('Failed to delete work', e);
      }
    }
    setShowDeleteConfirm(null);
  };

  const handleEditWork = (item: UserWorkItem) => {
    // 编辑模式：不带 config 参数（或带特定 edit 参数），进入工具页让用户加载模板或重新配置
    // 但根据需求“编辑跳转配置界面”，这里我们模拟加载该配置的状态
    // 由于工具页目前是从 URL config 参数初始化，我们直接传参即可进入“预览/编辑”状态
    // 若要区分纯编辑，可后续优化工具页逻辑。目前保持一致。
    const url = `/love/${item.toolKey}`;
    router.push(url);
  };

  const handleVisitWork = (item: UserWorkItem) => {
    // 访问模式：跳转到沉浸式分享页（工具页已有逻辑：带 config 参数即进入沉浸模式）
    const url = `/love/${item.toolKey}?config=${encodeURIComponent(JSON.stringify(item.config))}`;
    window.open(url, '_blank');
  };

  const handleShareWork = (item: UserWorkItem) => {
    const url = `${window.location.origin}/love/${item.toolKey}?config=${encodeURIComponent(JSON.stringify(item.config))}`;
    setShareUrl(url);
    setShareTitle(item.title);
    setShareCopied(false);
    setShareModalOpen(true);
  };

  // 组合操作函数
  const getComboShareUrl = (combo: ComboData) => {
    const encodedData = encodeURIComponent(JSON.stringify({
      items: combo.items,
      totalDuration: combo.totalDuration
    }));
    return `${window.location.origin}/combo/play?data=${encodedData}`;
  };

  const handleComboPlay = (combo: ComboData) => {
    const url = getComboShareUrl(combo);
    window.open(url, '_blank');
  };

  const handleComboShare = (combo: ComboData) => {
    const url = getComboShareUrl(combo);
    setShareUrl(url);
    setShareTitle(combo.name);
    setShareCopied(false);
    setShareModalOpen(true);
  };

  // 实际复制链接的函数
  const handleCopyShareUrl = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
        return;
      }

      // Fallback: 使用 execCommand
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch (error) {
      console.error('复制失败', error);
    }
  };

  const handleComboDelete = () => {
    if (!showComboDeleteConfirm) return;
    deleteCombo(showComboDeleteConfirm);
    setCombos(getCombos());
    setShowComboDeleteConfirm(null);
  };

  return (
    <div className="space-y-8 animate-slide-in-from-right-4 duration-500">
      {/* User Header */}
      <div className="relative bg-gradient-to-r from-rose-400 to-pink-500 rounded-3xl p-8 text-white shadow-lg shadow-rose-200 overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 p-24 bg-yellow-400/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
            <span role="img" aria-label="avatar">{profile.avatar}</span>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
            <p className="text-rose-100 text-sm mb-4">{profile.bio}</p>
            <div className="flex justify-center md:justify-start gap-6">
              <div className="text-center">
                <div className="font-bold text-xl">{profile.stats.works}</div>
                <div className="text-xs text-rose-100 opacity-80">累计作品</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">{profile.stats.visits}</div>
                <div className="text-xs text-rose-100 opacity-80">收获访问</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">{profile.stats.collections}</div>
                <div className="text-xs text-rose-100 opacity-80">模板收藏</div>
              </div>
            </div>
          </div>
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
            onClick={handleEditClick}
          >
            编辑资料
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">我的作品</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (works.length === 0) {
                    alert('还没有作品哦，先去创作一个吧~');
                    router.push('/love');
                  } else {
                    setIsComboOpen(true);
                  }
                }}
                className="bg-gradient-to-r from-violet-100 to-fuchsia-100 border-violet-200 hover:border-violet-300 text-violet-700"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                组合创作
              </Button>
              <div className="text-sm text-slate-400">共 {works.length} 个</div>
            </div>
          </div>

          <div className="space-y-4">
            {works.length === 0 && (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">还没有创作过作品，快去体验一下吧~</p>
                <Button variant="primary" className="mt-4" onClick={() => router.push('/love')}>
                  去创作
                </Button>
              </div>
            )}
            {works.map((item) => (
              <UserLinkItem
                key={item.id}
                item={item}
                onShare={handleShareWork}
                onEdit={handleEditWork}
                onVisit={handleVisitWork}
                onDelete={(id) => setShowDeleteConfirm(id)}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* 已保存的组合 */}
          {combos.length > 0 && (
            <Card className="!bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-100">
              <h3 className="font-bold text-violet-800 mb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-violet-500" /> 我的浪漫组合
              </h3>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {combos.map(combo => (
                  <div
                    key={combo.id}
                    className="group p-3 bg-white/70 rounded-xl border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-violet-800 truncate">{combo.name}</p>
                        <p className="text-xs text-violet-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {combo.items.length} 个作品 · {Math.floor(combo.totalDuration / 60)}分{combo.totalDuration % 60}秒
                        </p>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2 border-t border-violet-100">
                      <button
                        onClick={() => handleComboPlay(combo)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors text-xs font-medium"
                      >
                        <Play className="w-3.5 h-3.5" />
                        播放
                      </button>
                      <button
                        onClick={() => handleComboShare(combo)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors text-xs font-medium"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        分享
                      </button>
                      <button
                        onClick={() => setShowComboDeleteConfirm(combo.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="!bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
            <h3 className="font-bold text-rose-800 mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-500" /> 心意打赏・共赴浪漫
            </h3>
            <p className="text-sm text-rose-700/80 mb-4 leading-relaxed">
              你的小小打赏，是我们打磨更多美好仪式的动力，让每一份浪漫都有回响✨，你的每一份打赏，都是对浪漫的加码，让我们把更多心动仪式带给你～
            </p>
            <Button
              className="w-full bg-rose-400 hover:bg-rose-500 text-white shadow-rose-200"
              onClick={() => setIsPayOpen(true)}
            >
              支持我们
            </Button>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="编辑个人资料"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">个性签名</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none h-24"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">头像 (输入 Emoji)</label>
            <input
              type="text"
              value={editForm.avatar}
              onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
              maxLength={4}
            />
          </div>
          <div className="flex gap-4 justify-end mt-6">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>取消</Button>
            <Button variant="primary" onClick={handleSaveProfile}>保存</Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="传递爱意">
        <ShareContent />
      </Modal>

      {/* Pay Modal */}
      <Modal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} title="感谢支持">
        <div className="flex flex-col items-center space-y-4 p-4">
          <p className="text-slate-600 text-center">感谢你的每一份支持，<br />让这份浪漫得以延续。</p>
          <div className="relative w-64 h-64 rounded-xl overflow-hidden shadow-lg border border-slate-100">
            {/* Using standard img tag for simplicity since it's a local static file in public */}
            <img src="/pay.PNG" alt="Donation QR Code" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-slate-400">微信/支付宝 扫码支持</p>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="确认删除"
      >
        <div className="text-center space-y-6">
          <p className="text-slate-600">确定要将这份美好的回忆移除吗？<br />删除后无法找回哦。</p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>再想想</Button>
            <Button variant="danger" onClick={handleDeleteWork}>狠心删除</Button>
          </div>
        </div>
      </Modal>

      {/* Combo Delete Confirm Modal */}
      <Modal
        isOpen={!!showComboDeleteConfirm}
        onClose={() => setShowComboDeleteConfirm(null)}
        title="确认删除组合"
      >
        <div className="text-center space-y-6">
          <p className="text-slate-600">确定要删除这个浪漫组合吗？<br />删除后无法找回哦。</p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" onClick={() => setShowComboDeleteConfirm(null)}>再想想</Button>
            <Button variant="danger" onClick={handleComboDelete}>狠心删除</Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="💕 分享给 TA"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 mb-4">
              <Share2 className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-slate-600 mb-2">
              分享「<span className="font-medium text-rose-600">{shareTitle}</span>」
            </p>
            <p className="text-sm text-slate-400">复制下方链接，发送给 TA 吧~</p>
          </div>

          <div className="relative">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 break-all text-sm text-slate-600 max-h-24 overflow-y-auto">
              {shareUrl}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setShareModalOpen(false)}
            >
              关闭
            </Button>
            <Button
              variant="primary"
              onClick={handleCopyShareUrl}
              className={shareCopied ? '!bg-green-500 !hover:bg-green-600' : ''}
            >
              {shareCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  复制链接
                </>
              )}
            </Button>
          </div>

          {shareCopied && (
            <div className="text-center">
              <p className="text-sm text-green-600 animate-pulse">
                🎉 链接已复制，快去发给 TA 吧！
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Combo Creator Modal */}
      <ComboCreator
        works={works}
        isOpen={isComboOpen}
        onClose={() => setIsComboOpen(false)}
        onSaved={() => setCombos(getCombos())}
      />
    </div>
  );
}
