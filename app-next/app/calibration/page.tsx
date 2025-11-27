export default function CalibrationPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex w-full max-w-3xl flex-col items-center gap-6 px-16 py-32 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                    Blink Calibration
                </h1>
                <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                    Let's calibrate your blink detection. Follow the instructions to ensure accurate gameplay.
                </p>
            </main>
        </div>
    );
}
