export default function PermissionPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex w-full max-w-3xl flex-col items-center gap-6 px-16 py-32 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                    Webcam Permission Required
                </h1>
                <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                    This game requires access to your webcam to detect blinks. Please grant permission to continue.
                </p>
            </main>
        </div>
    );
}
