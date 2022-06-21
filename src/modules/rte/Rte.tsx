import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import ContentEditable from "react-contenteditable"
import { useRootStore } from "../../StoreProvider"

export const Rte = observer(() => {
    const { content, onKeyUp, saveCaretPosition, getEditorArea } =
        useRootStore()

    useEffect(() => {
        const textEditor = getEditorArea()
        if (!textEditor) return
        console.log("reload")
    }, [content])

    useEffect(() => {
        const textEditor = getEditorArea()
        if (!textEditor) return
        getEditorArea()!.innerHTML = content
    }, [])

    return (
        <div
            id="rich-text-editor-root"
            data-id="rich-text-editor-root"
            className="focus:outline-none my-0 h-full  min-h-[24px] w-full select-text overflow-auto bg-gray-100 px-2 py-2 overflow-wrap-anywhere"
            contentEditable="true"
            onKeyUp={onKeyUp}
            onClick={saveCaretPosition}
            onBlur={saveCaretPosition}
            // onKeyDown={onKeyDown}
        />
    )
})
