import { types, cast } from "mobx-state-tree"
import {
    findNodeDataId,
    generateDivIds,
    getDataId,
    insertNewNodeOnEnterKey,
    isDataSelected,
    sanitizeSpan,
} from "../../modules/rte/rte-helpers"

import { IRoot$ } from "../types"
import { nanoid } from "nanoid"
import { ContentEditableEvent } from "react-contenteditable"

export const Root$ = types
    .model("Root$", {
        id: "rich-text-editor-root",
        selection_node_id: "",
        caret_position: 0,
        is_dirty: false,
        content: "Hey",
    })
    .actions((self) => ({
        onChangeField<Key extends keyof typeof self>(
            key: Key,
            value: typeof self[Key]
        ): IRoot$ {
            self[key] = value

            return cast(self)
        },
        onChangeNewMessageContent(e: ContentEditableEvent) {
            self.content = e.target.value
        },
        getEditorArea(): HTMLElement | null {
            return document.getElementById(self.id)
        },
        saveCaretPosition(): void {
            const selection = window.getSelection()
            // console.log('saving caret position', window.getSelection())
            self.selection_node_id = findNodeDataId(selection?.anchorNode) ?? ""
            self.caret_position = selection?.anchorOffset ?? 0
        },
        setCaretPosition(): IRoot$ {
            if (self.selection_node_id) {
                this.getEditorArea()?.childNodes.forEach((node) => {
                    if (getDataId(node) === self.selection_node_id) {
                        window
                            .getSelection()
                            ?.setPosition(node.lastChild, self.caret_position)
                    }
                })
            }
            return cast(self)
        },
        createEmptyNode(): Element {
            const divElement = document.createElement("div")
            const brElement = document.createElement("br")
            divElement.setAttribute("data-id", nanoid(5))
            divElement.append(brElement)
            return divElement
        },
        sanitizeFromSpan(): void {
            const rte = this.getEditorArea()

            if (!rte) return

            rte.childNodes.forEach((node) => sanitizeSpan(node))
            self.content = rte.innerHTML
            self.is_dirty = false

            this.setCaretPosition()
        },
    }))
    .actions((self) => ({
        onKeyUp(/* e: React.KeyboardEvent<HTMLDivElement> */): void {
            self.content = self.getEditorArea()?.innerHTML ?? ""
            generateDivIds(self.getEditorArea())
            self.saveCaretPosition()
        },
        onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
            if (
                e.key === "Enter" ||
                e.key === "Tab" ||
                (e.key === "z" && e.ctrlKey)
            ) {
                e.preventDefault()
            }

            if (
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowUp" ||
                e.key === "ArrowDown"
            ) {
                self.saveCaretPosition()
                return
            }

            e.key === "Tab" && this.tabEvent()
            e.key === "Delete" && this.deleteEvent()
            e.key === "Enter" && this.enterEvent()
            // e.key === 'Backspace' && this.backspaceEvent()
        },
        tabEvent(): void {
            console.log("tab event")
        },
        // backspaceEvent(): void {
        //     console.log('backspace event')
        //     // if (isDataSelected()) {
        //     //     return
        //     // }
        // },
        deleteEvent(): void {
            const selection = window.getSelection()

            self.selection_node_id =
                findNodeDataId(selection?.anchorNode?.parentNode) ?? ""
            self.caret_position = selection?.anchorOffset ?? 0
            self.is_dirty = true
        },
        enterEvent(): void {
            const rte = self.getEditorArea()
            if (!rte || !self.selection_node_id) return

            self.saveCaretPosition()

            const newNode = self.createEmptyNode()

            if (getDataId(rte) === self.selection_node_id) {
                insertNewNodeOnEnterKey(rte, newNode)
                return
            }

            if (isDataSelected()) {
                self.saveCaretPosition()
                return
            }

            try {
                rte.childNodes.forEach((node, i) => {
                    if (getDataId(node) !== self.selection_node_id) return

                    // **
                    // * caret at start *
                    if (!self.caret_position) {
                        newNode.textContent = node.textContent
                        node.textContent = ""
                        node.appendChild(document.createElement("br"))
                        insertNewNodeOnEnterKey(rte, newNode, i)

                        rte.scrollTop = rte.scrollHeight
                        throw ""
                    }

                    // **
                    // * caret at end else in text *
                    if (node.textContent?.length === self.caret_position) {
                        insertNewNodeOnEnterKey(rte, newNode, i)
                    } else {
                        newNode.textContent =
                            node.textContent?.slice(self.caret_position) || ""
                        node.textContent =
                            node.textContent?.slice(0, self.caret_position) ||
                            ""
                        insertNewNodeOnEnterKey(rte, newNode, i)
                    }

                    // **
                    // * throw to stop iteration *
                    throw ""
                })

                rte.scrollTop = rte.scrollHeight
            } catch (error) {
                error && console.error("TEXT_EDITOR_ENTER_KEY_ERROR:", error)
            }
        },
    }))
