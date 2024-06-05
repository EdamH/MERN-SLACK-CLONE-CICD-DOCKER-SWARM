# MERN application with CI-CD pipeline

## Continuous Integration & Continuous Delivery Pipeline and Monitoring for a MERN application Orchestrated by Docker Swarm

CI/CD pipelines allow for a fast response to business needs, while other DevOps practices support stable, secure and predictable services, striking the perfect balance  between stability and the speed of change.

This is a project by Edam Hamza & Skander Chayoukhi realized for their end-of-year project at the Higher School of Communications at Tunis (SUP'COM).

It creates a Jenkins CI/CD pipeline for a MERN-stack application, with **development**, **staging** and **production** environments, tests and monitoring.

![CI/CD pipeline](./img/DevOps.png)

### Requirements and coverage

- [x] The application must be containerized
- [x] The application must communicate with a database
- [x] Containers must be managed by an orchestrator
- [x] It must be possible to test the pipeline locally (e.g. not require a cloud provider account)
- [x] Pushing to master must trigger a pipeline that terminates with a deployment to production (Continuous Delivery)
- [x] The pipeline must include Development, Staging and Production environments
- [x] The system must include application and infrastructure monitoring, and a dashboard
- [x] The underlying application must be a web-based platform that inspires from collaboration platforms like Slack & Discord.

### The Technological Stack

Currently the project uses the following technologies:

- Docker (incl. Docker Compose and Swarm)
- MongoDB, Express, Next.js and NodeJS (MERN stack)
- Jest (for unit tests)
- Dockerhub
- Jenkins
- Prometheus, Grafana and Container Advisor
- Nginx Reverse Proxy

### Underlying Application

The application placeholder was bootstrapped with [Create Next App](https://github.com/vercel/next.js/tree/02e144d37634d45edac1bd32a391c49edf1ef069/packages/create-next-app), the officially supported way to create single-page Next applications. The app was loosely based on [slack-clone-client](https://github.com/adeolaadeoti/slack-clone-client.git) with **heavy changes** and **fixes** implemented. The latter included **additional Features**, **Security Enhancements** and **Updates to the Interface**.

#### Brief Description

Our solution combines different features from known collaboration platforms, notably **Microsoft Teams**, **Slack** & **Discord** in a web-based platform that is tailored to the specific need of our community at SUP'COM. There are a more in-depth description of the application and the way its features work in the [supspace-client-ReadmeFile](https://gitlab.com/supspace/supspace-collaboration-platform/-/blob/main/supspace-client/README.md?ref_type=heads)

![Brief look at the application](./img/workspace-if.png)

### Application Architecture


Each environment includes a **frontal server** to serve static contents and pass API call to the backend, a **backend server** to query the database and serve API calls, and **a database**. Application telemetry is provided to Prometheus from the backend.

The Production environment are exposed to the outside world through the **NGINX reverse proxy** on port 80. This considerably enhances performance, security and logging capabilities. It give us more control over what a client can and cannot know about our internal servers. 

![Application Architecture](./img/web_architecture.png)

In each environment there are **subtle changes**, to account for the **desired use** of the environment (development, testing, etc.)

### Development

- The react frontend application is served with Node.

- The Express backend uses Nodemon, which reloads on code change (useful for standalone local environments, in the developer's machine).

- The database container is stateful, as its data resides inside the container (it is destroyed whenever the container is removed).

- When run standalone, the frontend, backend and database ports are exposed (see image below for port details).

### Staging

- The frontend is served with Nginx

- The backend is served with Node.

- Additional containers are used to build the static React and Express content of the client and server, and then pass it to the Nginx and Node containers respectively.

- The database data resides in a docker named volume (db_staging)

### Production

- Frontend and backend containers use the imutable images built for staging.

- The database data resides in a docker named volume (db_prod)

- Multiple replicas of the front and backend containers are orchestrated with Docker Swarm, to scale capacity according to demand.

![Environment containers and volumes](./img/environments.png)

## Folder structure

This project has the following file structure:
```
+- env-dev                <--- Docker-Compose files & Docker Volumes
|
+- supspace-cleint        <--- Frontend files (Next / JavaScript)
|
+- supspace-api           <--- Frontend files (Express / JavaScript)
|
+- ops                    <--- DevOps IaaC, including pipeline and integration tests
|
+- scripts                <--- Scripts to launch and tear-down the infrastructure
```

## Running the project

This DevOps ecosystem includes all containers shown in the image below.

![Ops containers](./img/Orchestration_and_volumes.png)

**Production** and the **DevOps infrastructure** are **segregated** for Security reasons (in separate bridge networks), so an **overlay network** is used to enable:

- Jenkins to make smoke test in production

- Prometheus to colect metrics from production

This infrastructure enables you to run a Continuous Delivery pipeline like the one presented in the image below, which is implemented in this project.

![Jenkins pipeline](./img/pipeline.png)

Typically a developer needs a **standalone development environment** on their local machine, to develop and test the application code. Once code is ready, the developer pushes that code to the SCM repository (Gitlab, in our case), triggering the Continuous Delivery pipeline. If the code was pushed to the **main branch**, it will be deployed in production with a **rolling deployment**, assuming it passes unit, integration and smoke tests, naturally.

To create a local development environment (on the developer's machine) **the machine needs to have docker and docker-compose installed**. If you want to run this pipeline on your machine, **the Docker Engine must be in Swarm mode**, as we'll use a swarm stack for production.

### Creating a local development environment

Create a local development environment using `docker-compose -f ./env-dev/docker-compose.dev.yml up -d`

These folders on your computer will be mapped to frontend and backend server foldders:

| Folder on your computer | Server (container) | Folder on server   |
| ----------------------- | ------------------ | ------------------ |
| ./supspace-client/src   | Frontend           | /app/client/src    |
| ./supspace-client/public| Frontend           | /app/client/public |
| ./supspace-api/src      | Backend            | /app/server/src    |

**Note:** when Jenkins builds and deploys the dev environment, within the pipeline, the code is copied to the container (not mapped).

You can access the application on your local dev environment at [http://localhost:3000](http://localhost:3000)

### Step 1 - Data persistance

We'll use Docker volumes to persist the staging and prod databases, as well as data in Jenkins and various other functionalities

The associated volumes are automatically created by docker-compose. However, some linux distributions will restrict access permissions to said volumes by the container. Thus, it would be best to create the necessary Docker volumes manually and giving them execution permission prior to running the docker-compose command or by running the script `./ops/create_volumes.sh`.


### Step 2 - Create a production bootstrap variables file

The development, staging and production secrets will live in Jenkins Credentials, but to start the production stack for the first time we'll create a file called `.env_prod` in the ./script folder, with the following contents:

```bash
SRV_PORT=8080
MONGO_URI=prod_mongodb://mongo:supspace1@localhost:27017/
MONGO_PORT=27017
MONGO_INITDB_ROOT_USERNAME=mongo
MONGO_INITDB_ROOT_PASSWORD=supspace-1
NODE_ENV=production
GIT_COMMIT=install
```

*.env* files are excluded in gitignore, so they will not be pushed to the Gitlab repository.

### Step 4 - Start the DevOps infrastructure (including production)

To start the DevOps pipeline infrastructure run the sript:

`./scripts/create_pipeline_and_prod.sh`

This will create containers for Jenkins, Prometheus and Grafana, an overlay network and clusters for the application's frontend, backend & Nginx, as well as a service for the production Mongo database.

Configure Jenkins
Use the `docker logs $(docker ps --filter , click onme=ops_jenkins_1  andq)` command to view the Jenkins service logs and find the installation password, in a segment looking like this:

```bach
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | *************************************************************
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | *************************************************************
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | *************************************************************
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    |
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | Jenkins initial setup is required. An admin user has been created and a password generated.
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | Please use the following password to proceed to installation:
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    |
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | 18b9792120c6466f82f37c95363bc7bf
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    |
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | This may also be found at: /var/jenkins_home/secrets/initialAdminPassword
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    |
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | *************************************************************
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | *************************************************************
cicd_stack_jenkins.1.jft378dfo4tm@docker-desktop    | *************************************************************
```

Open Jenkins (at [localhost:8000](http://localhost:8000/)), provide the password (in the screenshot above it is `18b9792120c6466f82f37c95363bc7bf`) and then click on the *Install suggested plugins* option.

After the pluggins finish installing, in the *Create First Admin User* page, create the following user:

| Field          | Value          |
| -------------- | -------------- |
| Username:      | pipelineadmin  |
| password:      | pipelinesecret |
| email address: | a@a.a          |

In the *Instance Configuration* page leave the URL as `http://localhost:8000/` and press the *Save and finish* button.

#### Optional: install Blue Ocean plugin

To install additional plugins, go to *Manage Jenkins* (left-hand menu), click on *Manage Plugins* and then click on the *Available* tab.

Type `Blue Ocean` on the text box and check the box for the pluggin with that name, then press *Download and install after restart*.

Finally, check the *Restart Jenkins when installation is complete and no jobs are running* checkbox at the bottom of the page.

**!!** Blue Ocean as it stands provides easy-to-use Pipeline visualization. It was intended to be a rethink of the Jenkins user experience, designed from the ground up for Jenkins Pipeline. Blue Ocean was intended to reduce clutter and increases clarity for all users.

### Step 5 - Create and clone the remote mern_app repository

Go to your preferred platform and create a repository. Call it `mern_app` and hit the *Create Repository* button.

To use the pipeline you need to clone the Gogs `mern_app` repository created above into a folder in your computer that must reside outside the folder where you cloned this [supspace-collaboration-platform](https://gitlab.com/supspace/supspace-collaboration-platform.git) project.

```bash
cd ..
# you should be otside the MERN_app_CI-CD_pipeline folder
git clone http://path/to/your/repo
cd mern_app
```

Copy the contents of the [supspace-collaboration-platform](https://gitlab.com/supspace/supspace-collaboration-platform.git) to the *mern_app* folder you created above, but **be carefull not to copy the  hidden .git folder** (if you copy from a local clone of this repo).

### Step 6 - Configure the pipeline

Go to Jenkins [http://localhost:8000](https://localhost:8000) and click *New Item* on the lefthand side menu. In the *Enter an item name* box, type `MERN app Continuous Delivery`, choose type *Multibranch Pipeline* and click *ok* at the bottom of the page.

In the next page, in the *General* tab, provide the values below:


| Field              | Value                                     |
| ------------------ | ----------------------------------------- |
| Branch source      | Git                                       |
| Project Repository | `http://path/to/your/repo`                |
| Credentials > Add  | MERN app Continuous Delivery              |

In the *Folder Credentials Provider: MERN app Continuous Delivery* pop-up, provide the following values:

| Field    | Valiue       |
| -------- | ------------ |
| Username | `username`   |
| Password | `password`   |

Press the *Add* button to return to the pipeline *General* tab.

In the *Credetials* field, select username/****

In the *Build Configuration* tab, leave *by Jenkisfile* selected and insert `ops/Jenkinsfile` in the *Script Path* box.

Install *the Multibranch Scan Webhook Trigger* for Jenkins in order to be able to trigger the pipeline with every push to the repository. This plugin is a general purpose webhook that works on any platform of your chosing. Keep in mind, however, that this **only** works if you deploy Jenkins on a **remote server**. The plugin should have a new section added to your pipeline configuration where you should specify your `http://path/to/your/repo`. This plugin requires further configuration on the repository platform that differs depending on what you chose (Refer to documentation for that). 

**!!** This webhook is **automatically** activated **if and only if** you are using **Github**.

### Step 7 - Store development, staging and production environment variables

Development, staging and production secrets will be stored in Jenkins Credentials.

For simplicity, we'll only keep secret the MongoDB admin password. To do this, go to [localhost:8000](http://localhost:8000/) and click *Manage Jenkins* on the lefthand side menu, then click on *Manage credentials*. Next, click on *Jenkins* in the *Stores scoped to Jenkins* section and then on *Global credentials (unrestricted)*.

Click *Add Crededntials* and repeat the proccess for each entry in the table below, using **Kind = Secret text**.

| Username                           | Password   |
| ---------------------------------- | ---------- |
| MONGO_INITDB_ROOT_PASSWORD_DEV     | supsace1   |
| MONGO_INITDB_ROOT_PASSWORD_STAGING | supsace1   |
| MONGO_INITDB_ROOT_PASSWORD_PROD    | supsace1   |

**!!** Keep in mind that for simplicity reasons and to make sure the app works for you, these variables are included in the docker-compose files. If you want to keep your application secured, you must remove them and do it this way instead.

### You are now ready to push code and run the pipeline

Go to the *mern_app* folder,  make your first commit and push to your repository platform:

```bash
git add .
git commit -m "Initial commit"
git push origin master/main
```

Now go to the Jenkins page on [http://localhost:8000](https://localhost:8000) and watch the pipeline execute. If you installed the Blue Ocean plugin, click on *Blue Ocean* on the lefthand side menu to use this enhanced UI.

Once your code passes unit, integration and smoke tests, your commit will be deployed into production with a rolling update.

![Click to see pipeline at work](./img/jenkins-pipeline.jpg)

## Observability

Both infrastructure monitoring and application telemetry use Prometheus to scrape metrics from the application, cAdvisor, etc. You can then observe these metrics using Grafana dashboards.

To see the Prometheus targets go to [http://localhost:9090/targets](http://localhost:9090/targets).

### Setting up Grafana dashboards

To view Grafana dashboards go to [http://localhost:7070/containers/](http://localhost:7070/containers/) and log-in with:

```bash
User: admin
Password: grafanasecret
```

Click on the *configuration* icon on the left vertical bar and choose *data sources*, then click on the *add data source* button, select Prometheus and on the URL text box type `http://prometheus:9090`. Click on the *Save & Test* button at the bottom of the page to finish.

Now that we are getting metrics from Prometheus, let's create the first Grafana dashboard, with metrics collected from inside the application (with the library *prom-client*).

#### Application telemetry

The application is really simple and there's not much we can measure, but let's measure the number of times the web page page was shown and count the number of database connections successfully established, a well as any failures.

We'll create a dashboard like this:

![Monitoring the app](./img/MERN_APP_dashboard.png) 

To create the application telemetry dashboard, click on '+' sign on the left side vertical icon bar and choose *dashboard*. On the new dashboard, click the *+ Add new pannel* button and then select Prometheus as the data source. In the metrics text box paste the first PromQL query in the table below, give the pannel a descriptive title and press the "Apply" button.

Repeat for the remaining metrics.

| Función                                        | PromQL query                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Number of times the app page was seen          | MERN_APP_web_app_calls{instance="supspace-api:4000",job="MERN_APP"}          |
| Number of server/DB conections errors          | MERN_APP_db_connection_failures{instance="supspace-api:4000",job="MERN_APP"} |
| Number of successfull server/DB conections     | MERN_APP_db_connection_successes{instance="supspace-api:4000",job="MERN_APP"}|
| Number of times Prometheus scraped app metrics | MERN_APP_metrics_read_total{instance="supspace-api:4000",job="MERN_APP"}     |

#### Container monitoring

To create a dashboard to monitor the containers, click on '+' sign on the left side vertical icon bar and choose *import*.

Type `179`in the *Import via grafana.com* box, the press *load*, choose Prometheus as the data source and click *Import* to finish.

![Container dashboard](./img/cAdvisory_dashboard.png) 

### A word about OS'

This project was designed and tested in Windows 11 and tweaked to also work for Linux Ubuntu, with Docker Desktop in swarm mode. Some changes may be required if you want to run it in MacOS.

## Deployment to Azure

If you have gotten all of the above to work locally, you are ready to migrate to a remote server. You can chose whatever cloud provider you like.

Azure provides 100$ for students enrolled in a university, or through the Github Student Pack. 

We chose to use Microsoft Azure for our project. In order to create a virtual machine on Azure:

- **1-** Log into your Azure account.
- **2-** Hit the *create virtual machine* button on the screen that appears.
- **3-** This takes you to a different interface where you should hit the *Create* button.
- **4-** This takes you to a third interface containing a form. Follow the instructions to choose the specifications of your machine
- **5-** Once created, go over to *Network Configuration* and open up the HTTP, SSH, Prometheus and Grafana Ports on the firewall.
- **6-** If you chose to access your machine through SSH, a key should have been downloaded to your machine (DO NOT LOSE IT).
- **7-** SSH into your remote server and pull the repository you have created. The command should look something like this `ssh -i remote-machine_key.pem azureuser@public_ip_address`

The image below showcases the machine that we opted to use for this solution:

 ![Azure Server](./img/azure-machine.jpg) 

 **!!** Chances are, the machine will have been brought down by the time you see this screenshot. That's why the IP@ won't work. 


## Improvements

Oh, where to start?...

There are many, many improvements that need to be made in order to make this a production ready solution. Here are a few, just to get you started:

### Security
  
- Backups ***must*** be implemented. Please! Now! A quick way to start is to mount the docker volumes is a separate container and use it to make copies.
  
### Availability  

- Jenkins and the other servers that support the pipeline should be clustered (e.g. adding Jenkins workers).

- In this example Docker Swarm only has one host. It's quite simple to add workers to swarm.

- Here and there you will find images that are not locked to a specific version (e.g. occurences of latest, LTS, etc.) This can generate make builds mutable and generate inestability. It can be solved easily by specifying a specific version (e.g. mongo:4.4.0-bionic).

- Docker named volumes should be replaced with something more persistent, like a cloud driver, for example.

- In order for swarm to have more than one node, a shared file storage system must be used.

### Operation

- Due to time restrictions the configuration of the different containers was done mostly manually. Much could be automated (Using [Jenkins Configuration as Code](https://github.com/jenkinsci/configuration-as-code-plugin), for example).

- Image tagging should be improved (including the project name, for example)

### Testing

- Tests were implemented as proof of concept. There are only a few unit test, one integration test and one smoke test. In a normal operation, code coverage can be an indicator of the minimum number of unit tests that should. There would also be many more unit tests than integration and end-to-end tests.

- Other types of tests should be incorporated, including stress tests, Fuzz tests and Soak tests.

### Bottlenecks

- Concurrent pipeline execution of unit tests is not safe at this stage. Further testing is required.

- The pipeline takes far too long to run. Work should be done to take it down to five minutes at most.


# Feel free to contribute!