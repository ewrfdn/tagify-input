export class TagifyInput {
  constructor ({ el, copyProporty = [] }) {
    this.el = el
    // this.setCssText()
    // this.autoInsertZeroWdithSpace = autoInsertZeroWdithSpace
    el.style = 'font-size:14px;color:#000000d9'
    this.el.contentEditable = true
    // this.el.appendChild(br)
    this._value = []
    this.lastEditRange = null
    this.el.onclick = (e) => {
      this.updateLastRange()
    }
    this.el.onkeydown = (event) => {
      console.log('keydown', event.key)
      if (event.key === 'Enter') {
        event.preventDefault() // 阻止浏览器默认换行操作
        return false
      } else if (event.key === 'ArrowRight') {
        // https://stackoverflow.com/questions/46217922/the-cursor-disappear-when-pressing-the-right-arrow-key
        const sel = window.getSelection()
        const nodes = sel.anchorNode.childNodes
        const selection = sel.anchorOffset
        let loops = 0
        let i = selection
        if (nodes.length > 0 || (nodes.length === 0 && sel.anchorNode.length ===
                    selection && sel.anchorNode.nextSibling !== null)) {
          var r = document.createRange()
          if (nodes.length === 0 && sel.anchorNode.length === selection &&
                        sel.anchorNode.nextSibling !== null) {
            r.setStartBefore(sel.anchorNode.nextSibling)
            r.setEndAfter(sel.anchorNode.nextSibling)
          } else {
            while (i < nodes.length) {
              loops += 1
              if (nodes[i].nodeType !== 3) {
                break
              }
              i++
            }
            r.setEnd(this.el, selection + loops)
            r.setStart(this.el, selection)
          }
          sel.removeAllRanges()
          sel.addRange(r)
          this.el.focus()
        }
      }
      // this.updateLastRange()
    }
    this.el.onkeyup = (e) => {
      this.updateLastRange()
    }
    this.copyProporty = copyProporty
  }

  setCssText () {
    const style = document.createElement('style')
    style.innerText = this.cssText
    document.body.appendChild(style)
  }

  insertAfter (newElement, targetElement) {
    const parent = targetElement.parentNode
    if (parent.lastChild === targetElement) {
      parent.appendChild(newElement)
    } else {
      parent.insertBefore(newElement, targetElement.nextSibling)
    }
  }

  getTagName (element) {
    if (typeof (element.tagName) === 'string') {
      return element.tagName.toLowerCase()
    } else if (element.nodeName) {
      return element.nodeName.toLowerCase()
    } else {
      return null
    }
  }

  updateLastRange () {
    const selection = getSelection()
    console.log('rangeCount', selection.rangeCount)
    this.lastEditRange = selection.getRangeAt(0)
    console.log(this.lastEditRange)
  }

  get cursorIndex () {
    console.log(this.lastEditRange)
    let res = []
    const childNodes = this.childNodesToList(this.el.childNodes)

    if (this.lastEditRange === null) {
      res = [childNodes.length, 0]
      return res
    }
    const startContainer = this.lastEditRange.startContainer
    if (startContainer === this.el) {
      res = [this.lastEditRange.startOffset, 0]
    } else {
      const index = childNodes.findIndex(e => e === startContainer)
      res = [index + 1, this.lastEditRange.startOffset]
    }
    return res
  }

  set cursorIndex (index) {
    let startNodeIndex = index[0]
    let offset = index[1]
    const childNodes = this.childNodesToList(this.el.childNodes)
    if (startNodeIndex > childNodes.length) {
      startNodeIndex = childNodes.length
    }
    const selection = getSelection()
    const range = document.createRange()
    if (startNodeIndex === 0) {
      range.setStart(this.el, 0)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      this.updateLastRange()
      return
    }
    const startNode = childNodes[startNodeIndex - 1]
    console.log(startNode)
    const tagName = this.getTagName(startNode)
    if (tagName === 'span') {
      offset = 0
      range.setStart(this.el, startNodeIndex)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    } else if (tagName === '#text') {
      const text = startNode.data
      if (text && offset > text.length) {
        offset = text.length
      }
      range.selectNodeContents(startNode)
      range.setStart(startNode, offset)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    this.updateLastRange()
  }

  get value () {
    const childNodes = this.childNodesToList(this.el.childNodes)
    const res = []
    childNodes.forEach((e, index) => {
      const tagName = this.getTagName(e)
      if (tagName === '#text') {
        if (e.data && e.data !== '\u200B') {
          res.push({
            index: index,
            value: e.data.replace('\u200B', ''),
            type: 'text'
          })
        }
      } else if (tagName === 'span') {
        const tagItemConfig = {
          index: index,
          value: e.value,
          type: 'tag'
        }
        for (const propertyName of this.copyProporty) {
          tagItemConfig[propertyName] = e[propertyName]
        }
        res.push(tagItemConfig)
      }
    })
    return res
  }

  set value (valueList) {
    this.el.innerHTML = ''
    this._value = valueList
    let preValue = ''
    for (const item of valueList) {
      const { value, type } = item
      if (type === 'tag') {
        if (preValue) {
          const textNode = document.createTextNode(preValue)
          this.el.appendChild(textNode)
        }
        const tag = this.createTag(item)
        this.el.appendChild(tag)
        // if (this.autoInsertZeroWdithSpace) {
        //     const textNode = document.createTextNode("\u200B")
        //     this.el.appendChild(textNode)
        // }
        preValue = ''
      } else if (type === 'text') {
        preValue += value
      }
    }
    if (preValue) {
      const textNode = document.createTextNode(preValue)
      this.el.appendChild(textNode)
    }
    const br = document.createElement('br')
    this.el.appendChild(br)
  }

  createTag (config) {
    const { value } = config
    const tag = document.createElement('span')
    const maxWidth = this.el.clientWidth - 36
    const backgroundColor = '#eeeeee'
    const fontColor = '#000000d9'
    tag.innerHTML = `<span style="margin-left:4px;position: relative;top:0px;font-size: 12px;">${value}</span><span class="close" style="padding:0px 4px;position:relative;top:-4px" ><svg style="position:relative;top:2px;left:4px" t="1663324576584" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1369" data-spm-anchor-id="a313x.7781069.0.i1" width="16" height="16"><path d="M504.224 470.288l207.84-207.84a16 16 0 0 1 22.608 0l11.328 11.328a16 16 0 0 1 0 22.624l-207.84 207.824 207.84 207.84a16 16 0 0 1 0 22.608l-11.328 11.328a16 16 0 0 1-22.624 0l-207.824-207.84-207.84 207.84a16 16 0 0 1-22.608 0l-11.328-11.328a16 16 0 0 1 0-22.624l207.84-207.824-207.84-207.84a16 16 0 0 1 0-22.608l11.328-11.328a16 16 0 0 1 22.624 0l207.824 207.84z" p-id="1370" fill="${fontColor}"></path></svg></span>`
    tag.style = `
        background:${backgroundColor};
        border:solid 1px #aaa;
        color${fontColor};
        height:16px
        font-size:12px;
        border-radius:2px;
        margin:0px 1px 0px 1px;
        white-space: nowrap;
        white-space:nowrap;
        height:14px;
        transition: .13s ease-out;
        vertical-align:middle;
        overflow:hidden; 
        text-overflow:ellipsis; 
        display:inline-block;
        padding:1px;
        `
    tag.className = 'uneditable-tag'
    tag.onmouseover = (e) => {
      tag.style.backgroundColor = '#ddeeee'
      // tag.style.padding = "1px"
    }
    tag.onmouseout = (e) => {
      tag.style.backgroundColor = backgroundColor
      // tag.style.padding = "0px"
    }
    tag.title = value
    const textNode = tag.childNodes[0]
    textNode.style.display = 'inline-block'
    textNode.style.maxWidth = `${maxWidth}px`
    textNode.style.textOverflow = 'ellipsis'
    textNode.style.overflow = 'hidden'
    textNode.verticalAlign = 'middle'
    const closeButton = tag.childNodes[1].childNodes[0]
    closeButton.style.borderRadius = '50%'
    closeButton.style.width = '10px'
    closeButton.style.height = '10px'

    closeButton.color = '#000000d9'
    closeButton.onclick = (e) => {
      let parentNode = e.target
      while (parentNode && parentNode.className !== 'uneditable-tag') {
        parentNode = parentNode.parentNode
      }
      console.log('remove', parentNode)
      this.el.removeChild(parentNode)
    }
    closeButton.onmouseover = (e) => {
      closeButton.style.backgroundColor = '#eebbbb'

      // tag.style.padding = "1px"
    }
    closeButton.onmouseout = (e) => {
      closeButton.style.backgroundColor = '#00000000'
      // tag.style.padding = "0px"
    }
    tag.value = value
    tag.type = tag
    for (const propertyName of this.copyProporty) {
      if (config[propertyName]) {
        tag[propertyName] = config[propertyName]
      }
    }
    tag.contentEditable = false
    return tag
  }

  childNodesToList (childNodes) {
    const res = []
    for (let i = 0; i < childNodes.length; i++) {
      const nodeName = this.getTagName(childNodes[i])
      if (nodeName === 'br') {
        continue
      }
      // else if (nodeName === '#text' && this.autoInsertZeroWdithSpace && nodeName.data === '\u200B') {
      //     continue
      // }
      res.push(childNodes[i])
    }
    return res
  }

  addTag (tagConfig) {
    const res = this.value
    const itemConfig = { value: tagConfig.value, ...tagConfig, type: 'tag' }
    const cursorIndex = this.cursorIndex
    console.log(cursorIndex)
    if (cursorIndex[0] === 0) {
      res.unshift(itemConfig)
      this.value = res
      this.cursorIndex = [cursorIndex[0] + 1, 0]
      return
    }
    const currentDom = res[cursorIndex[0] - 1]
    if (!currentDom) {
      console.log('currentDom is undefined')
      return
    }
    if (currentDom.type === 'tag') {
      res.splice(cursorIndex[0], 0, itemConfig)
    } else {
      if (cursorIndex[1] === currentDom.value.length) {
        res.splice(cursorIndex[0], 0, itemConfig)
      } else if (cursorIndex[1] === 0) {
        res.splice(cursorIndex[0] - 1, 0, itemConfig)
      } else {
        const start = currentDom.value.slice(0, cursorIndex[1])
        const end = currentDom.value.slice(cursorIndex[1])
        res.splice(cursorIndex[0] - 1, 1,
          { value: start, type: 'text' },
          itemConfig,
          { value: end, type: 'text' }
        )
      }
    }
    this.value = res
    this.cursorIndex = [cursorIndex[0] + 1, 0]
  }
}
