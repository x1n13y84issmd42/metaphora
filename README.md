## metaphora
This small framework, codenamed `metaphora` at the moment, aims at providing a set of fluent and unobtrusive tools for persistent reentrant computations, called `operations` in terms of the framework.

### The idea
Modern web applications mainly have adopted a data-centric approach, with REST being the main driver for that, which resulted in the simplest operations (as one would desribe them naturally, like "user authenticates", "user pays for goods, receives an email") being broken down into extremely complex parts, and modern web application don't model processes anymore, but exist as Tender Loving Care providers to a complex and ever-evolving data model which became the centerpiece of infrastructure.

On the other hand, the mainstream architectural thought has been the most profound in the Java and C# lands, and, as it is customary in those very western languages, the architecture became very intrusive, turning from a mere tool to an obnoxious attention whore or a cult.

So, there are two intentions behind `metaphora`:
1. bring computations back to computers;
2. hide the architecture
3. allow for linear description of non-linear processes

### Thoughts & examples, problems & exercises
Consider the following business case:

***As a user I want to access my archived data***

*Which includes the following steps:*
* *Two-factor authentication*
* *Request AWS Glacier for archive retrieval*
* *if archive is ready*
  * *process it*
  * *notify user*
* *else if archive is not ready*
  * *break; come back later.*

It's a simple sequence of quite complex operations, which happen asynchronously and with arbitrary delays because not all the data is available at the moment of invocation (i.e. user has not entered the 2FA code yet, Glacier has not unfrozen the needed archive yet, etc.). Execution of this simple operation may take days, and at the same time it must be possible to program it in the most linear and procedural fashion possible.

Let's write this down in some TS-flavoured pseudocode:

```typescript
function accessArchive(user: User, archiveId) {
	if (TFA(user)) {				//	BREAK + data input
		requestArchive(archiveId);
		if (archiveIsReady(archiveId)) {	//	data input
			process();
			notifyUser(user, 'Ready');
		} else {
			BREAK;
		}
	} else {
		throw new Error(`Unauthorized`);
	}
}
```

while this is looking like a the most boring function ever, its execution may take days, it will require additional input and can continue its execution after deployments.

#### TFA()
The `TFA()` function is an operation itself:
```typescript
function TFA(user: User) {
	let issued = issueCode();
	BREAK;			//	BREAK
	let read = readCode();	//	data input
	return issued === read;
}
```

### Roots
Basically, this is an attempt to build a framework around a few well known patterns and techniques:
* Command
* Template methods
* Observer/PubSub
* Specification **(?)**
* Anemic polymorphic models (they keep data only, not behavior)
* Polymorphism based on unions/intersections instead of inheritance
* Pattern matching for types (via Typescript's type guards)

Also, some philosophical ideas also have influence over this design:
* The world is not made of "objects"; it is rather a process, and what we perceive as objects are small segments of eternally boiling caleidoscope of probabilities, a tiny momentary snapshot of endless space-time. A desire to have strictly shaped data models under these conditions is cute, but probably a dead end, and programs can be should become processes again.

* Information doesn't exist on itself, it emerges as a result of perception and cognition, i.e. as a result of some process applied to another processes. When applied to software this might mean that we move our focus from modelling data, as it is at the moment in the web industry, to modelling processes, and the data is incorporated into them as their intrinsic properties and effects.

### Operations
Operation is an abstraction of a unit of work, which not necessarily completes after the invocation, i.e. it can be interrupted mid-execution, then safely continued from where it left off.

Operations sport the following properties:
1. They are (or, rather, must be) reentrant;
2. They are persistent
3. They can be supplied with extra data over the course of execution

### Records
Records are metaphora's data objects.