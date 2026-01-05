const Loader = ({loadingText}: { loadingText?: string }) => (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] flex justify-center items-center gap-2">
            <div className="fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center">
                <div className="py-2 px-5 rounded-lg flex items-center flex-col">
                    <div className="loader-dots block relative w-20 h-5 mt-2">
                        <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="text-slate-500 mt-2 text-center">
                        {loadingText ?? 'Working'}...
                    </div>
                </div>
            </div>
        </div>
    </div>
)

export default Loader
