import {Link} from "react-router-dom";

const Page = () => {
    return (
        <>
            <div className="flex flex-row gap-x-6">
                <div className="grid grid-rows-3">
                    <div className="flex justify-center items-center mx-auto p-2">
                        <dl className="text-center text-xs sm:text-sm font-medium">
                            <dt className="text-sm">3</dt>
                            <dd>votes</dd>
                        </dl>
                    </div>
                    <div className="flex justify-center items-center mx-auto border-2 border-slate-200 p-1.5 sm:p-2 rounded-lg">
                        <dl className="text-center text-xs sm:text-sm font-medium">
                            <dt className="text-sm">3</dt>
                            <dd>answers</dd>
                        </dl>
                    </div>
                    <div className="flex justify-center items-center mx-auto p-2">
                        <dl className="text-center text-xs sm:text-sm font-medium">
                            <dt className="text-sm">12</dt>
                            <dd>views</dd>
                        </dl>
                    </div>
                </div>
                <div className="flex flex-1 flex-col justify-between h-auto">
                    <div className="flex-1">
                        <Link to={'/questions/question-id'} className="text-lg font-semibold">
                            Lorem ipsum
                        </Link>
                        <p className="mt-1 line-clamp-3 text-sm">
                            Vestibulum aliquam vitae eros nec sodales. Proin sed turpis eget ipsum porta tempus. Nullam felis nibh, suscipit in lectus eu, pharetra vehicula neque. Nulla eget magna consequat, porttitor leo sed, pretium lacus. Praesent nisi lectus, rhoncus sed dignissim eu, faucibus id ante. Donec sit amet magna venenatis, elementum est eu, condimentum velit. Sed maximus sem et nisi vulputate pulvinar. Quisque condimentum eros eget vulputate accumsan. Vestibulum aliquam, orci ac iaculis posuere, urna tellus malesuada augue, nec pellentesque lectus urna vel lectus.
                        </p>
                        <div className="flex flex-row gap-x-2 mt-2 mb-3">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    Bitcoin
                </span>
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    Nostrosity
                </span>
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    NIPS
                </span>
                        </div>
                    </div>


                    <div className="flex flex-row py-3 align-middle justify-center">
                        <a href="#" className="group block flex-shrink-0 flex-1">
                            <div className="flex items-center">
                                <div>
                                    <img
                                        className="inline-block h-9 w-9 rounded-lg"
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        alt=""
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Tom
                                        Cook</p>
                                    <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700">View
                                        profile</p>
                                </div>
                            </div>
                        </a>
                        <div>
                            <dl className="text-right text-sm">
                                <dt>asked</dt>
                                <dd>6 hours ago</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page;
