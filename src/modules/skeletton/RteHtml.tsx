import { observer } from "mobx-react-lite"
import { useRootStore } from "../../StoreProvider"

export const RteHtml = observer(() => {
    const { content } = useRootStore()
    return (
        <div className="flex h-full w-full bg-gray-50 border-gray-300 border rounded-md p-2 overflow-auto overflow-wrap-anywhere">
            {content}
        </div>
    )
})
