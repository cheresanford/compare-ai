import { ref } from "vue";

const baseUrl = <string>"http://localhost:3000";
const defaultHeaders = {
  "Content-Type": "application/json",
};
export function useApi(endpoint: string) {
  let requestUrl = baseUrl + endpoint;
  const loading = ref<boolean>(false);

  const getRequest = async (requestUrl: string) => {
    loading.value = true;
    const response = await fetch(baseUrl + requestUrl, {
      method: "GET",
      headers: defaultHeaders,
    });
    loading.value = false;

    return response.json();
  };

  const postRequest = async (requestUrl: string, payload: any) => {
    console.log("payload: ", payload);

    payload;
    loading.value = true;
    const response = await fetch(baseUrl + requestUrl, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    });
    loading.value = false;
    return response.json();
  };

  const putRequest = async (requestUrl: string, payload: any) => {
    console.log("payload: ", payload);

    payload;
    loading.value = true;
    const response = await fetch(baseUrl + requestUrl, {
      method: "PUT",
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    });
    loading.value = false;
    return response.json();
  };

  const deleteRequest = async (requestUrl: string) => {
    loading.value = true;
    const response = await fetch(baseUrl + requestUrl, {
      method: "DELETE",
      headers: defaultHeaders,
    });
    loading.value = false;
    return response.json();
  };

  return { getRequest, postRequest, putRequest, deleteRequest, loading };
}
