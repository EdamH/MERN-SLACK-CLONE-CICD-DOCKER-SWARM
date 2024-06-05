# Create volumes for Jenkins, Prometheus and Grafana
sudo mkdir -p ../ops/var/prometheus/prometheus_data
sudo mkdir -p ../ops/etc/prometheus
sudo chmod -R 777 ../ops/var/prometheus/prometheus_data
sudo chmod -R 777 ../ops/etc/prometheus

sudo mkdir -p ../ops/var/grafana/grafana_data
sudo mkdir -p ../ops/etc/grafana/provisioning
sudo chmod -R 777 ../ops/var/grafana/grafana_data
sudo chmod -R 777 ../ops/etc/grafana/provisioning
