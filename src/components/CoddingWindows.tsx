import { FuckRte } from "../modules/rte/FuckRte"
import { Skeletton } from "../modules/skeletton/Skeletton"

export const CoddingWindows = () => {
    return (
        <div className="flex w-full h-[calc(100%-var(--header-height))] bg-yellow-200 overflow-auto relative">
            <FuckRte />
            <Skeletton />
        </div>
    )
}
