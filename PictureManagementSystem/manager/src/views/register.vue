<template>
  <div class="login-ctn">
    账号注册
    <el-form
      :model="ruleForm"
      :rules="rules2"
      status-icon
      ref="ruleForm"
      label-width="100px"
      class="login-form"
    >
      <el-form-item label="用户名" prop="name">
        <el-input v-model="ruleForm.name"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pass">
        <el-input type="password" v-model="ruleForm.pass" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input type="password" v-model="ruleForm.checkPass" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="register-form-button" type="primary" @click="submitForm('ruleForm')">提交</el-button>
        <el-button class="register-form-button" @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="desc">
      已有账号，
      <span class="go-register" @click="goLogin">去登录</span>
    </div>
  </div>
</template>

<script>
import {userRegister} from '@/apis/index'
export default {
  name: 'Login',
  data () {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.pass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      ruleForm: {
        pass: '',
        checkPass: '',
        name: ''
      },
      rules2: {
        pass: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        checkPass: [{ validator: validatePass, trigger: 'blur' }],
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
      }
    }
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          userRegister(this.ruleForm).then(res => {
            if (res.status) {
              this.$message({
                message: '注册成功！',
                type: 'success'
              })
              this.$store.dispatch('UserRegister', res.data)
              this.$router.push('/home')
            } else {
              this.$message({
                message: '注册失败',
                type: 'error'
              })
            }
          })
        } else {
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    goLogin () {
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less">
.login-ctn {
  padding: 100px;
  display: flex;
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

.register-form-button {
  width: 45%;
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
