<template>
  <div>
    <div id="12" class="tagify-input"></div>
    <input type="text" v-model="tagValue" />
    <button @click="add">add tag</button>
  </div>
</template>

<script>
import { TagifyInput } from 'tagify-input'
export default {
  name: 'Home',
  data () {
    return {
      tagValue: '',
      tag: null
    }
  },
  mounted () {
    this.tag = new TagifyInput({
      el: document.getElementById('12'),
      copyProperties: ['prop']
    })
    this.tag.value = [
      {
        prop: '123',
        value: '123',
        type: 'tag'
      },
      {
        prop: '1234',
        value: 'text',
        type: 'text'
      }
    ]
  },
  methods: {
    add () {
      this.tag.addTag({ value: this.tagValue, prop: 'elID' })
      console.log(this.tag.value)
    }
  }
}
</script>
  <style lang="less" scoped>
.tagify-input {
  background: #ccc;
  height: 60px;
  width: 400px;
  text-align: left;
}
</style>
