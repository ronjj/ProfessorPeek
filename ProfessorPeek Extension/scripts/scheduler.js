const findRightColumn = document.getElementsByClassName("col-xs-12 col-sm-3 col-sm-push-9");
// Find a right column child by class name
const innerRightColumn = findRightColumn[0].getElementsByClassName("roster-sidenav-tab roster-sidenav-tab-build active");
// Find child elements that are <scheduler-course ng-repeat="course in currentView.schedule.courses | orderBy:['subject','catalogNbr']" course="course" class="ng-scope ng-isolate-scope" 
const courseElements = innerRightColumn[0].getElementsByClassName("ng-scope ng-isolate-scope");



console.log(innerRightColumn.length);




