<template>
  <div class="login-ctn">
    用户登录
    <el-form
      :model="ruleForm2"
      :rules="rules2"
      status-icon
      ref="ruleForm2"
      label-width="100px"
      class="login-form"
    >
      <el-form-item label="用户名" prop="name">
        <el-input v-model="ruleForm2.name"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pass">
        <el-input type="password" v-model="ruleForm2.pass" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="login-form-button" type="primary" @click="submitForm('ruleForm2')">登录</el-button>
      </el-form-item>
    </el-form>
    <div class='desc'>还没有账号？<span class='go-register' @click="goRegister">立即注册</span></div>
  </div>
</template>

<script>
import store from '../store'
import {userLogin} from '../apis/index'
export default {
  name: 'Login',
  data () {
    return {
      ruleForm2: {
        pass: '',
        name: ''
      },
      rules2: {
        pass: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
      }
    }
  },
  created () {
    let token = store.state.token
    if (token) {
      this.$router.replace('/home')
    }
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          userLogin(this.ruleForm2).then(res => {
            console.log(res)
            if (res.status) {
              this.$message({
                message: '登录成功！',
                type: 'success'
              })
              console.log(res)
              this.$store.dispatch('UserLogin', res.data)
              this.$store.dispatch('UserInfo', res.data)
              this.$router.push('/home')
            } else {
              this.$message({
                message: '登录失败',
                type: 'error'
              })
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    goRegister () {
      this.$router.push('/register')
    }
  }
}
</script>

<style lang="less">
.login-ctn {
  padding: 100px;
  display: flex;
  text-align: center;
  justify-content: center;
  flex-direction: column;
}

.login-form,
.register-form {
  width: 40%;
  padding-top: 30px;
  padding-right: 100px;
  max-width: 400px;
  margin: 20px auto;
}

.login-form-button {
  width: 100%;
  font-size: 16px;
  text-decoration: none;
  white-space: normal;
}
.desc {
  font-size: 16px;
  color: #666;
  .go-register {
    color: #985e6d;
    cursor: pointer;
  }
}
</style>
