import { Form, Input, Button, Divider, App } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import GoogleButton from "../Buttons/GoogleButon/GoogleButton";

export default function LoginForm() {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  return (
    <div>
      <Form
        form={form}
        name="register"
        layout="vertical"
        onFinish={()=>{}}
        autoComplete="off"
        variant="filled"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email address" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please enter a password" }]}
        >
          <Input.Password
            minLength={6}
            maxLength={12}
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
      <Divider>Or</Divider>
      <GoogleButton></GoogleButton>
    </div>
  );
}