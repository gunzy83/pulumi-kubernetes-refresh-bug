import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const provider = new k8s.Provider("default", {
  context: "k3d-pulumi",
  namespace: "default",
});

new k8s.core.v1.ConfigMap(
  "deployed-configmap",
  {
    metadata: {
      name: "deployed-configmap",
      namespace: "default",
      labels: {
        "app.kubernetes.io/name": "deployed-configmap",
      },
    },
    data: {
      "test-key": "test-value",
      "another-key": "another-value",
    },
  },
  { provider: provider }
);

