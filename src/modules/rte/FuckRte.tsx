import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import ContentEditable from 'react-contenteditable'
import { useRootStore } from '../../StoreProvider'

export const FuckRte = observer(() => {
    const {
        content,
        onChangeNewMessageContent,
        onKeyDown,
        is_dirty,
        saveCaretPosition,
        sanitizeFromSpan,
        getEditorArea,
    } = useRootStore()

    useEffect(() => {
        // console.log('is_dirty!!!!!')
        sanitizeFromSpan()
    }, [is_dirty])

    useEffect(() => {
        const textEditor = getEditorArea()
        if (!textEditor) return
    }, [])

    return (
        <ContentEditable
            id="rich-text-editor-root"
            data-id="rich-text-editor-root"
            className="focus:outline-none my-0 max-h-64  min-h-[24px] w-full select-text overflow-auto bg-gray-100 px-2 py-2"
            html={content}
            onChange={onChangeNewMessageContent}
            onBlur={saveCaretPosition}
            onKeyDown={onKeyDown}
            onClick={saveCaretPosition}
        />
    )
})
