export const getDataId = (node: ChildNode | Node | null | undefined): string => {
    if (!node) return ''

    const createParent = document.createElement('div')
    const clonedNode = node?.cloneNode()
    createParent.append(clonedNode)

    const regExp = new RegExp(/data-id=".+?"/gim)
    const getDataId = createParent.innerHTML.match(regExp)?.[0]?.replace(new RegExp(/(data-id=)|(")/g), '')
    return getDataId || ''
}

export const findNodeDataId = (node: Node | ChildNode | ParentNode | null | undefined): string => {
    if (!node) return ''

    let dataId: string = getDataId(node)

    if (!dataId) {
        dataId = findNodeDataId(node.parentNode)
    }

    return dataId
}

export const getNodeByDataId = (data_id: string): Element | null => {
    return document.querySelector(`[data-id="${data_id}"]`)
}

export const sanitizeSpan = (node: ChildNode) => {
    if (node.nodeName === 'SPAN') {
        const getParentDataId = findNodeDataId(node)

        if (getParentDataId) {
            const parentNode = getNodeByDataId(getParentDataId)

            if (parentNode) {
                const textContent = parentNode?.textContent ?? '' + node.textContent ?? ''
                node.parentNode?.removeChild(node)
                parentNode.textContent = textContent
            }
        }
    }

    if (node.hasChildNodes()) {
        node.childNodes.forEach((node) => sanitizeSpan(node))
    }
}

export const insertNewNodeOnEnterKey = (rte: HTMLElement, newNode: Element, position = 0) => {
    if (!newNode.textContent && !newNode.childNodes[0]) newNode.appendChild(document.createElement('br'))

    const range = document.createRange()
    range.setStart(rte, position + 1)
    range.setEnd(rte, position + 1)
    range.insertNode(newNode)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.setPosition(newNode, 0)
}

export const isDataSelected = (): boolean => {
    const selection = window.getSelection()
    const rootNode = getNodeByDataId('rich-text-editor-root')

    if (!rootNode || !selection) return false

    const anchorNode = selection.anchorNode
    const focusNode = selection.focusNode
    const anchorOffset = selection.anchorOffset
    const focusOffset = selection.focusOffset

    const anchorNode_DATA_ID = findNodeDataId(anchorNode)
    const focusNode_DATA_ID = findNodeDataId(focusNode)

    if (!anchorNode_DATA_ID || !focusNode_DATA_ID) throw new Error('DATA_SELECT_ERROR')

    const dataIsSelected =
        (anchorOffset !== focusOffset && anchorNode_DATA_ID === focusNode_DATA_ID) ||
        (anchorOffset !== focusOffset && anchorNode_DATA_ID !== focusNode_DATA_ID) ||
        (anchorOffset === focusOffset && anchorNode_DATA_ID !== focusNode_DATA_ID)

    if (!dataIsSelected) {
        return false
    }

    if (anchorOffset !== focusOffset && anchorNode_DATA_ID === focusNode_DATA_ID) {
        const node = getNodeByDataId(anchorNode_DATA_ID)

        if (!node) throw new Error('DATA_SELECT_ERROR')

        let start_slice = 0
        let end_slice = 0

        if (anchorOffset < focusOffset) {
            start_slice = anchorOffset
            end_slice = focusOffset
        } else {
            start_slice = focusOffset
            end_slice = anchorOffset
        }

        const content_block_1 = node.textContent?.slice(0, start_slice) || ''
        const content_block_2 = node.textContent?.slice(end_slice, node.textContent?.length) || ''

        const mergedContent = content_block_1 + content_block_2

        if (mergedContent) {
            node.textContent = mergedContent
            selection.setPosition(node.lastChild, start_slice)
        } else {
            node.textContent = ''
            node.appendChild(document.createElement('br'))
            selection.setPosition(node, 0)
        }

        return true
    }

    if (
        (anchorOffset !== focusOffset && anchorNode_DATA_ID !== focusNode_DATA_ID) ||
        (anchorOffset === focusOffset && anchorNode_DATA_ID !== focusNode_DATA_ID)
    ) {
        const anchor_node_data = {
                index: 0,
                slice: anchorOffset,
                data_id: '',
                no_content: false,
                content: '',
                selection_start: false,
            },
            focus_node_data = {
                index: 0,
                slice: focusOffset,
                data_id: '',
                no_content: false,
                content: '',
                selection_start: false,
            }

        rootNode.childNodes.forEach((node, index: number) => {
            if (findNodeDataId(node) === focusNode_DATA_ID) {
                focus_node_data.index = index
                focus_node_data.data_id = focusNode_DATA_ID
            }
            if (findNodeDataId(node) === anchorNode_DATA_ID) {
                anchor_node_data.index = index
                anchor_node_data.data_id = anchorNode_DATA_ID
            }
        })

        if (anchor_node_data.index < focus_node_data.index) {
            anchor_node_data.selection_start = true
        } else {
            focus_node_data.selection_start = true
        }

        const start_node = anchor_node_data.selection_start ? anchor_node_data : focus_node_data
        const end_node = !anchor_node_data.selection_start ? anchor_node_data : focus_node_data

        const nodes_for_complete_removal: string[] = []

        try {
            rootNode.childNodes.forEach((node, index: number) => {
                if (index < start_node.index || index > end_node.index) return

                if (start_node.index === index) {
                    const content_block = node.textContent?.slice(0, start_node.slice) || ''

                    if (content_block) {
                        node.textContent = content_block
                        selection.setPosition(node.lastChild, start_node.slice)
                    } else {
                        start_node.no_content = true
                    }
                }

                // --- remove nodes between selection
                if (index !== start_node.index && index < end_node.index) {
                    nodes_for_complete_removal.push(findNodeDataId(node))
                }
                // \\ --- remove nodes between selection

                if (end_node.index === index) {
                    const content_block = node.textContent?.slice(end_node.slice, node.textContent.length) || ''

                    if (content_block) {
                        node.textContent = content_block
                    } else {
                        end_node.no_content = true
                    }

                    if (start_node.no_content && end_node.no_content) {
                        getNodeByDataId(start_node.data_id)?.remove()
                        getNodeByDataId(end_node.data_id)?.remove()
                        return
                    }

                    if (start_node.no_content && !end_node.no_content) {
                        getNodeByDataId(start_node.data_id)?.remove()
                        node.textContent = content_block
                        selection.setPosition(node.lastChild, end_node.slice)
                        return
                    }

                    if (!start_node.no_content && end_node.no_content) {
                        const startNode = getNodeByDataId(start_node.data_id)
                        if (!startNode) throw new Error('DATA_SELECT ERROR: START_NODE IS MISSING')

                        const content_block_from_start_node = startNode.textContent
                        startNode.textContent = content_block_from_start_node + content_block

                        selection.setPosition(startNode.lastChild, start_node.slice)
                        getNodeByDataId(end_node.data_id)?.remove()
                        return
                    }

                    if (!start_node.no_content && !end_node.no_content) {
                        const startNode = getNodeByDataId(start_node.data_id)
                        if (!startNode) throw new Error('DATA_SELECT ERROR: START_NODE IS MISSING')

                        const content_block_from_start_node = startNode.textContent
                        startNode.textContent = content_block_from_start_node + content_block

                        selection.setPosition(node.lastChild, start_node.slice)
                        nodes_for_complete_removal.push(findNodeDataId(node))
                        return
                    }
                }
            })

            nodes_for_complete_removal.forEach((data_id) => {
                getNodeByDataId(data_id)?.remove()
            })
        } catch (error) {
            error && console.error('Text Editor error:', error)
        }

        return true
    }

    return false
}
