<template>
  <el-form ref="postForm" :model="postForm" :rules="rules">
    <sticky class-name="sub-navbar">
      <el-button v-if="!isEdit" @click="showGuid">显示帮助</el-button>
      <el-button
        v-loading="loading"
        type="success"
        style="margin-left: 10px"
        @click="submitForm"
      >
        {{ isEdit? '编辑电子书' : '新增电子书' }}
      </el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <warning />
        <el-col :span="24">
          <ebook-upload
            :file-list="fileList"
            :disabled="isEdit"
            @onSuccess="onUploadSuccess"
            @onRemove="onUploadRemove"
          />
        </el-col>
        <el-col :span="24">
          <el-form-item prop="title">
            <MDInput
              v-model="postForm.title"
              :maxlenghth="100"
              name="name"
              required
            >
              书名
            </MDInput>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="author" label="作者" :label-width="labelWidth">
                <el-input v-model="postForm.author" placeholder="作者" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="publisher" label="出版社" :label-width="labelWidth">
                <el-input v-model="postForm.publisher" placeholder="出版社" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="language" label="语言" :label-width="labelWidth">
                <el-input v-model="postForm.language" placeholder="语言" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="rootFile" label="根文件" :label-width="labelWidth">
                <el-input v-model="postForm.rootFile" placeholder="根文件" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="filePath" label="文件路径" :label-width="labelWidth">
                <el-input v-model="postForm.filePath" placeholder="文件路径" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="unzipPath" label="解压路径" :label-width="labelWidth">
                <el-input v-model="postForm.unzipPath" placeholder="解压路径" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="coverPath" label="封面路径" :label-width="labelWidth">
                <el-input v-model="postForm.coverPath" placeholder="封面路径" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="fileName" label="文件名称" :label-width="labelWidth">
                <el-input v-model="postForm.fileName" placeholder="文件名称" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="cover" label="封面图片" :label-width="labelWidth">
                <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
                  <img :src="postForm.cover" class="preview-img">
                </a>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import Sticky from '@/components/Sticky'
import Warning from './Warning'
import EbookUpload from '@/components/EbookUpload'
import MDInput from '@/components/MDinput'
import { createBook, getBook, updateBook } from '@/api/book'

const fileds = {
  title: '书名',
  author: '作者',
  publisher: '出版社',
  language: '语言'
}

export default {
  components: {
    Sticky,
    Warning,
    EbookUpload,
    MDInput
  },
  props: {
    isEdit: Boolean
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error(fileds[rule.field] + '不能为空'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      postForm: {
      },
      fileList: [],
      labelWidth: '120px',
      rules: {
        title: [{ validator: validateRequire }],
        author: [{ validator: validateRequire }],
        publisher: [{ validator: validateRequire }],
        language: [{ validator: validateRequire }]
      }
    }
  },
  created() {
    if (this.isEdit) {
      const fileName = this.$route.params.fileName
      this.getBookData(fileName)
    }
  },
  methods: {
    getBookData(fileName) {
      getBook(fileName).then(res => {
        this.setData(res.data)
      })
    },
    setData(data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        coverPath,
        filePath,
        unzipPath,
        fileName
      } = data
      this.postForm = {
        ...this.postForm,
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        coverPath,
        filePath,
        unzipPath,
        fileName
      }
      this.fileList = [{ name: originalName || fileName, url }]
    },
    setDefault() {
      this.$refs.postForm.resetFields()
      this.fileList = []
    },
    showGuid() {
      console.log('guid')
    },
    submitForm() {
      const onSuccess = (res) => {
        const { msg } = res
        this.$notify({
          title: '操作成功',
          message: msg,
          type: 'success',
          duration: 2000
        })
        this.loading = false
        this.setDefault()
      }
      this.loading = true
      this.$refs.postForm.validate((valid, fields) => {
        if (valid) {
          const book = { ...this.postForm }
          if (!this.isEdit) {
            createBook(book).then(res => {
              onSuccess(res)
            }).catch(() => {
              this.loading = false
            })
          } else {
            updateBook(book).then(res => {
              onSuccess(res)
            }).catch(() => {
              this.loading = false
            })
          }
        } else {
          const message = fields[Object.keys(fields)[0]][0].message
          this.$message({
            message: message,
            type: 'error'
          })
          this.loading = false
        }
      })
    },
    onUploadSuccess(data) {
      this.setData(data)
    },
    onUploadRemove() {
      this.setDefault()
    }
  }
}
</script>

<style lang="scss" scoped>
  .detail-container {
    padding: 40px 50px 20px;
    .preview-img {
      width: 200px;
      height: 270px;
    }
  }
</style>
