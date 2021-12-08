# Deployment Guide

- build -> docker image tagged with sha
- push to registry, deploy via compose/k8s
- migrations run before rollout (backward compatible)
- health endpoint gates traffic; rollback = redeploy previous tag
