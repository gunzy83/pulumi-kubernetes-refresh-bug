# Reproduction steps

## Setup

* Install k3d (`brew install k3d`)
* Create a k3d cluster (`k3d cluster create pulumi`)
* Install Pulumi CLI and Node.js (`asdf install`, using `.tool-versions` file)
  * Use your own preferred method for installing Pulumi and Node.js if not using `asdf`
* Install dependencies (`npm ci`)
* Pulumi init (`pulumi stack init repro`)

## Steps

* `pulumi up` to create a ConfigMap
* `kubectl apply --server-side --force-conflicts -f ssa-apply1.yaml` to update the ConfigMap
* `pulumi refresh` and observe that the update to the labels is not detected

During the work that lead me here I found that certain updates to Services would not happen if there was another field manager co-owning the fields (port in particular) and the `patchForce` annotation would not take over the field ownership. I removed the ownership of the label here to make sure this was not an issue here:

```bash
kubectl get configmaps -n default deployed-configmap --show-managed-fields -o json |\
  jq 'del(.metadata.managedFields[] | select(.manager | contains("pulumi") | not ))' |\
  kubectl replace --raw /api/v1/namespaces/default/configmaps/deployed-configmap -f -
```

`pulumi refresh` shows no changes.

Additionally, let's try this with data changes:

* `kubectl apply --server-side --force-conflicts -f ssa-apply2.yaml` to update the ConfigMap with data changes
* `pulumi refresh` and observe that the data changes are not detected

`pulumi up` also shows no changes and applying it makes no updates (as I would expect with no change to the state).


## Cleanup

* `pulumi down` to delete the resources and stack
* `pulumi stack rm repro` to remove the stack
* `k3d cluster delete pulumi` to delete the k3d cluster
