Cordova/Sling sample - blog server
----------------------------------

A Sling-based server to support the cordova-sling-sample-app.


## Preconditions

As a first step, launch Sling.

The Sling Container can be launched by running the following command in the 
launchpad/builder/target directory:
	$ java -jar org.apache.sling.launchpad-<version>-standalone.jar
so if the current version is 7, the command should be:
	$ java -jar org.apache.sling.launchpad-7-standalone.jar

This launches sling on the default port: 8080.


## Install

Install `path-based-rtp` first:

	$ cd server/path-based-rtp
	$ mvn clean install -P autoInstallBundle

Next, install `espblog`:

	$ cd ../espblog
	$ mvn clean install -P autoInstallBundle


## Verify

To verify that the bundle is correctly installed:

1) http://localhost:8080/apps/espblog/html.esp must return the html.esp script.

2) Log in by visiting http://localhost:8080/?sling:authRequestLogin=true,
   using username=admin and password=admin

3) The console at http://localhost:8080/system/console/bundles must list both 
   the following bundles as active:

     Apache Sling ESP blog sample 
         (org.apache.sling.samples.espblog)
     Apache Sling Sample Path Based Resource Type Provider
         (org.apache.sling.samples.path-based.rtp)


## How to blog

Head to [http://localhost:8080/content/espblog/*.html](http://localhost:8080/content/espblog/*.html). Use the 'New Post' link on the left to create a new post.