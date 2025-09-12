import axios from "axios";
import { serverApi } from "../API/server";
import type { APIResponse } from "../types/ApiResponse";

function defaultFallback(error: any) : APIResponse {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Unknown Error";

    if (status === 401) {
      return { success: false, error: "Invalid Credentials." };
    } else if (status === 400) {
      return { success: false, error: message };
    } else {
      return {
        success: false,
        error: "Error while connecting to the Server.",
      };
    }
  }

  return { success: false, error: "Unexpected Error." };
}

export async function register(name: string, email: string, password: string) : Promise<APIResponse>{
  try {
    const response = await serverApi.post(`/auth/register`, {
      name,
      email,
      password,
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Unknown Error";
      return { success: false, error: message };
    }
    return { success: false, error: "Unexpected Error." };
  }
}

export async function login(email: string, password: string) : Promise<APIResponse>{
  try {
    const response = await serverApi.post(`/auth/login`, { email, password });
    return { success: true, data: response.data };
  } catch (error: any) {
    return defaultFallback(error);
  }
}

export async function authMe() : Promise<APIResponse>{
  try {
    const response = await serverApi.get(`/auth/me`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return defaultFallback(error);
  }
}

export async function searchUsers(email: string) : Promise<APIResponse>{
  try {
    const response = await serverApi.get(`/user/search`, {
      params: {
        email,
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return defaultFallback(error);
  }
}

export async function createChat(chatInfos: object) : Promise<APIResponse>{
  try {
    const response = await serverApi.post(`/chat`, chatInfos);
    return { success: true, data: response.data };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Unknown Error";
      if (status == 409){
        return { success: false, error: message }
      }
    }
    return defaultFallback(error);
  }
}

export async function fetchUserChats() : Promise<APIResponse>{
  try {
    const response = await serverApi.get(`/chat`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return defaultFallback(error);
  }
}

export async function fetchChatMessages(chatId:string,page:number) : Promise<APIResponse>{
  try {
    const response = await serverApi.get(`/messages/${chatId}`,{
      params: {
        page: page,
        size:500,
      }
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return defaultFallback(error);
  }
}

export async function uploadPicture(file: File) : Promise<APIResponse>{
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await serverApi.post(
      '/user/picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return defaultFallback(error);
  }
}

export async function sendImage(file: File) : Promise<APIResponse>{
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await serverApi.post(
      '/chat/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return defaultFallback(error);
  }
}