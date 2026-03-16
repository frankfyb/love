export default function ToolLoading() {
    return (
        <main className="flex h-screen w-full items-center justify-center bg-black text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">正在加载魔法...</p>
            </div>
        </main>
    );
}
