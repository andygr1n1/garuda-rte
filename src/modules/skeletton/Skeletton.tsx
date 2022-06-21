import { observer } from "mobx-react-lite"
import { useRootStore } from "../../StoreProvider"

export const Skeletton = observer(() => {
    const { content } = useRootStore()
    return (
        <div className="flex flex-[50%] h-full w-full bg-green-100">
            {content}
        </div>
    )
})
