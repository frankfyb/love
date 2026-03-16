import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">
            <div className="text-center space-y-6 px-4">
                <div className="text-8xl">💔</div>
                <h1 className="text-4xl font-bold text-slate-800">找不到页面</h1>
                <p className="text-lg text-slate-500 max-w-md mx-auto">
                    这个页面似乎不存在，让我们回到充满爱的地方吧
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center px-8 py-3 rounded-full bg-rose-400 hover:bg-rose-500 text-white font-medium transition-all duration-300 shadow-lg shadow-rose-200"
                >
                    回到首页
                </Link>
            </div>
        </div>
    );
}
