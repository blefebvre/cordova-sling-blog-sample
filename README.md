Cordova + Sling blog app
------------------------

A simple blog app built with Cordova and powered by Sling.


## Server

The server side components are based upon the [espblog sample](https://github.com/apache/sling/tree/trunk/samples/espblog), with the small addition of a script to [handle .json](server/espblog/src/main/resources/initial-content/apps/espblog/json.esp) requests. 


### Requirements

As a first step, launch Sling.

The Sling Container can be launched by running the following command in the 
launchpad/builder/target directory:
	$ java -jar org.apache.sling.launchpad-<version>-standalone.jar
so if the current version is 7, the command should be:
	$ java -jar org.apache.sling.launchpad-7-standalone.jar

This launches sling on the default port: 8080.


### Install

Install `path-based-rtp` first:

	$ cd server/path-based-rtp
	$ mvn clean install -P autoInstallBundle

Next, install `espblog`:

	$ cd ../espblog
	$ mvn clean install -P autoInstallBundle


### Verify

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


### How to blog (from your browser)

Head to [http://localhost:8080/content/espblog/*.html](http://localhost:8080/content/espblog/*.html). Use the 'New Post' link on the left to create a new post.


## App


### Requirements

- [node.js](http://nodejs.org/) version `>=0.10.x`
- [Cordova CLI](https://cordova.apache.org/docs/en/3.5.0/guide_cli_index.md.html#The%20Command-Line%20Interface) version `>=3.5.*`
- (iOS only) Xcode version `>=5.1.*`
- (iOS only) [ios-sim](https://github.com/phonegap/ios-sim#installation) 
- (Android only) [Apache Ant](http://ant.apache.org/bindownload.cgi)
- (Android only) [Android SDK](https://developer.android.com/sdk/index.html)
- (cloud build only) [PhoneGap Build](https://build.phonegap.com/) account 


### Build

If you have the build toolchain installed (Android users: replace `ios` with `android`):

	$ cordova platform add ios
	$ cordova build ios


### Run

	$ cordova emulate ios

Check out the [Cordova CLI](https://cordova.apache.org/docs/en/3.5.0/guide_cli_index.md.html#The%20Command-Line%20Interface) docs for more details, including installing onto a device.


### PhoneGap Build

Alternatively, use [PhoneGap Build](https://build.phonegap.com/) to build the app for a number of platforms in the cloud (note: some platforms require keys to be uploaded beforehand):

1. Log in to PhoneGap build using your Adobe ID
2. Tap the '+ new app' button
3. Enter the URL to this github repository (https://github.com/blefebvre/cordova-sling-blog-sample)
4. Tap 'Pull from .git repository'
5. When it finishes fetching, tap 'Ready to build'
6. Once each platform finishes compiling you may scan the QR code with a device to download and install your app.