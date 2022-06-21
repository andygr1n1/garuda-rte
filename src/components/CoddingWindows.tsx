import { Rte } from "../modules/rte/Rte"
import { RteHtml } from "../modules/skeletton/RteHtml"

export const CoddingWindows = () => {
    return (
        <div className="flex w-3/4 gap-2 relative p-4 h-full overflow-auto">
            <div className="flex flex-[50%] bg-white rounded-md border border-gray-300">
                <Rte />
            </div>
            <div className="flex flex-[50%] bg-white rounded-r-md">
                <RteHtml />
            </div>
        </div>
    )
}
