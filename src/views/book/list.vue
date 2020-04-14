<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="书名"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-input
        v-model="listQuery.author"
        placeholder="作者"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-select
        v-model="listQuery.category"
        placeholder="分类"
        clearable
        class="filter-item"
        @change="refresh"
      >
        <el-option
          v-for="item in categoryList"
          :key="item.value"
          :label="item.label + '(' + item.num + ')'"
          :value="item.value"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        style="margin-left: 10px"
        icon="el-icon-search"
        @click="handleFilter"
      >
        查询
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        style="margin-left: 5px"
        @click="handleCreate"
      >
        新增
      </el-button>
      <el-checkbox
        v-model="showCover"
        class="filter-item"
        style="margin-left: 5px"
        @change="changeShowCover"
      />
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :default-sort="defaultSort"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" />
      <el-table-column label="书名" align="center" width="150">
        <template slot-scope="{ row: { titleWrapper } }">
          <span v-html="titleWrapper" />
        </template>
      </el-table-column>
      <el-table-column label="作者" align="center" width="150">
        <template slot-scope="{ row: { authorWrapper } }">
          <span v-html="authorWrapper" />
        </template>
      </el-table-column>
      <el-table-column label="出版社" prop="publisher" width="150" align="center" />
      <el-table-column label="分类" prop="categoryText" width="100" align="center" />
      <el-table-column label="语言" prop="language" align="center" />
      <el-table-column v-if="showCover" label="封面" align="center" width="150">
        <template slot-scope="{ row: { cover } }">
          <a :href="cover" target="_blank">
            <img :src="cover" style="width: 120px; height: 180px">
          </a>
        </template>
      </el-table-column>
      <el-table-column label="文件名" prop="fileName" width="100" align="center" />
      <el-table-column label="文件路径" width="100" align="center">
        <template slot-scope="{ row: { filePath } }">
          <span>{{ filePath | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="封面路径" prop="coverPath" width="100" align="center" />
      <el-table-column label="解压路径" prop="unzipPath" width="100" align="center" />
      <el-table-column label="上传人" prop="createUser" width="100" align="center" />
      <el-table-column label="上传时间" width="100" align="center">
        <template slot-scope="{ row: { createDt } }">
          <span>{{ createDt | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-button type="text" icon="el-icon-delete" style="color: #f56c6c" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="refresh"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import { getCategory, listBook, deleteBook } from '@/api/book'
import { parseTime } from '@/utils'
export default {
  components: { Pagination },
  directives: { waves },
  filters: {
    valueFilter(value) {
      return value || '无'
    },
    timeFilter(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '无'
    }
  },
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        sort: '+id',
        title: '',
        author: '',
        category: null
      },
      showCover: false,
      categoryList: [],
      list: [],
      total: 0,
      defaultSort: {}
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.getList()
    next()
  },
  created() {
    console.log('created', this.listQuery)
    this.parseQuery()
  },
  mounted() {
    this.getList()
    this.getCategoryList()
  },
  methods: {
    wrapperKeyword(k, v) {
      function highLight(value) {
        return `<span style="color: #1890ff">${value}</span>`
      }
      const searchStr = this.listQuery[k]
      if (!searchStr) {
        return v
      } else {
        return v.replace(new RegExp(searchStr, 'ig'), highLight(searchStr))
      }
    },
    parseQuery() {
      const query = { ...this.$route.query }
      query.category && (query.category = +query.category)
      query.page && (query.page = +query.page)
      query.pageSize && (query.pageSize = +query.pageSize)
      const sort = query.sort ? query.sort : this.listQuery.sort
      this.defaultSort = {
        order: sort[0] === '+' ? 'ascending' : 'descending',
        prop: sort.slice(1)
      }
      this.listQuery = { ...this.listQuery, ...query }
    },
    getList() {
      listBook(this.listQuery).then(res => {
        const { list, count } = res.data
        this.list = list
        this.total = count
        this.listLoading = false
        this.list.forEach(book => {
          book.titleWrapper = this.wrapperKeyword('title', book.title)
          book.authorWrapper = this.wrapperKeyword('author', book.author)
        })
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.sort = '+' + prop
      } else {
        this.listQuery.sort = '-' + prop
      }
      this.handleFilter()
    },
    getCategoryList() {
      getCategory().then(res => {
        this.categoryList = res.data
      })
    },
    refresh() {
      this.$router.push({
        path: '/book/list',
        query: this.listQuery
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.refresh()
    },
    handleCreate() {
      this.$router.push('/book/create')
    },
    handleUpdate(row) {
      this.$router.push('/book/edit/' + row.fileName)
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除电子书，是否继续？', '提示', {
        confirmButtonText: '确定',
        canceleButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBook(row.fileName).then(res => {
          this.$notify({
            title: '成功',
            message: res.msg || '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      }).catch(() => {})
    },
    changeShowCover(value) {
      this.showCover = value
    }
  }
}
</script>

<style>

</style>
