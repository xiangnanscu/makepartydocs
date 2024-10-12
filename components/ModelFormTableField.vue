<route lang="yaml"></route>
<script setup lang="jsx">
import { computed, ref, createVNode } from "vue";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import ModelBatchButton from "~/components/ModelBatchButton.vue";
import { Modal } from "ant-design-vue";
import "ant-design-vue/lib/modal/style/css";
import "ant-design-vue/lib/notification/style/css";

const props = defineProps({
  model: { type: [Object, Function], required: true },
  modelValue: { type: Array, default: () => [] },
  columns: { type: Array },
  uniqueKey: { type: String, default: "" },
  downloadUrl: { type: String, default: "" },
  formWidth: { type: String, default: "70%" }, // 低于ModelPanel的formWidth以便有层次感
  hideDownload: { type: Boolean, default: true },
  hideUpload: { type: Boolean, default: true },
});
const emit = defineEmits(["update:modelValue", "deleteRow", "read"]);
const adminModel = shallowRef(props.model);
const records = computed(() => props.modelValue);
const toAntdColumns = (names) => {
  return names.map((k) => ({
    title: adminModel.value.name_to_label[k],
    dataIndex: k,
    field: adminModel.value.fields[k],
  }));
};

const tableColumns = computed(() => [
  { title: "#", key: "#" },
  ...toAntdColumns(props.columns || adminModel.value.admin?.list_names || adminModel.value.names),
  { title: "操作", key: "action" },
]);

const findDuplicates = (rows) => {
  console.log("findDuplicates", { rows });
};

const editRecord = ref(null);
const showUpdateForm = computed(() => !!editRecord.value);
const showCreateForm = ref(false);

const uniqueKey = computed(
  () => props.uniqueKey || Object.values(adminModel.value.fields).find((f) => f.unique)?.name,
);
const deleteRecord = (index) => {
  Modal.confirm({
    icon: createVNode(ExclamationCircleOutlined, { style: { color: "red" } }),
    content: "确认删除这条记录吗",
    okText: "删除",
    okType: "danger",
    onOk() {
      emit("deleteRow", index);
    },
    cancelText: "取消",
  });
};
const onSuccessCreate = (data) => {
  records.value.push(data);
  showCreateForm.value = false;
};
const onSuccessUpdate = (data) => {
  Object.assign(editRecord.value, data);
  editRecord.value = null;
};
const onClickEdit = (record) => {
  editRecord.value = record;
};
const RenderImage = ({ value }) => {
  if (Array.isArray(value)) {
    return <img src={value[0].ossUrl} class="admin-list-avatar" />;
  } else {
    return <img src={value} class="admin-list-avatar" />;
  }
};
const tagColorArray = ["geekblue", "orange", "green", "cyan", "red", "blue", "purple"];
</script>
<template>
  <a-row type="flex" justify="space-between">
    <a-col>
      <a-modal
        v-model:visible="showCreateForm"
        title="创建"
        @cancel="showCreateForm = false"
        :maskClosable="false"
        closable
        :width="formWidth"
      >
        <template #footer> </template>
        <model-form
          v-if="showCreateForm"
          :labelCol="6"
          @submit="onSuccessCreate"
          :model="adminModel"
          :values="adminModel.get_defaults()"
        ></model-form>
      </a-modal>
      <a-modal
        v-model:visible="showUpdateForm"
        title="编辑"
        @cancel="editRecord = null"
        :maskClosable="false"
        closable
        :width="formWidth"
      >
        <template #footer> </template>
        <model-form
          v-if="showUpdateForm"
          :labelCol="6"
          @submit="onSuccessUpdate"
          :model="adminModel"
          :values="editRecord"
        ></model-form>
      </a-modal>

      <model-batch-button
        v-if="adminModel"
        @findDuplicates="findDuplicates"
        @read="emit('read', $event)"
        @uploadRows="emit('update:modelValue', $event)"
        :hideDownloadAll="true"
        :hideDownload="props.hideDownload"
        :hideUpload="props.hideUpload"
        :uniqueKey="uniqueKey"
        :model="adminModel"
        :rows="props.modelValue"
        :downloadUrl="props.downloadUrl"
      ></model-batch-button>
      <a-button @click.prevent="showCreateForm = true">
        <plus-outlined></plus-outlined>
        添加
      </a-button></a-col
    >
  </a-row>
  <a-table
    :dataSource="records"
    :columns="tableColumns"
    :pagination="{ hideOnSinglePage: true, pageSize: 10000 }"
  >
    <template #bodyCell="{ column, index, record, text, value }">
      <template v-if="column?.key === '#'">{{ index + 1 }}</template>
      <template v-else-if="column?.field">
        <model-field-render :field="column.field" :record="record"></model-field-render>
      </template>
      <template v-else-if="column?.key === 'action'">
        <span>
          <a-button type="link" size="small" @click.prevent="onClickEdit(record)"> 编辑 </a-button>
          <a-button type="link" size="small" style="color: red" @click.prevent="deleteRecord(index)"
            >删除</a-button
          >
        </span>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.admin-list-avatar {
  max-width: 100px;
  max-height: 100px;
}
</style>
