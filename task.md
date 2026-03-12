<!-- 1. table ke upar pagination honi chahiye bilkul upar fi;ter ke neche -->
<!-- 2. level me different colors se represent -->
<!-- 3. inactive red kr dena  -->
<!-- 4. search filter cities ko chnage krna -->
<!-- 5. Serach me University nai a araha  -->
<!-- 6. reset button red ho -->
<!-- 7. api se agar fetch na ho raha ho to error card show jo reload -->
<!-- 8. onboard me last line me ura do  -->
<!-- 9. email or phone ura do -->
<!-- 10. map physical dalna. -->
<!-- 11. principal school authority data access data nai kr sakta -->
<!-- 12. dashboard pr school detail page dikhana hai aur sara button delete kr dene -->
<!-- 13. toolkit dalna buttons me  -->
<!-- 14. reuse onboard input in every page -->
<!-- 15.  agar to assign hai pehle replace  -->
<!-- 16. agr to assign nai hai inactive hai aur assign kro -->
<!-<!-- id: 27 -->

<!-- - [x] **UI Components**
    - [x] Create reusable `Button` component with Tooltip.
    - [x] Implement `Button` in Teachers Registry.
    - [x] Implement `Button` in Classes Registry.
    - [x] Implement `Button` in Class Detail. -->
<!-- 18. deparmetn search input deni hai status base aur department -->
<!-- 19.  acadmaic matrix me card bnan upar wala ko -->
<!-- 20. Jab sidebar me spacing issue aur logo position fix kr do -->
<!-- 21. sidebar align krna buttons -->
<!-- 22. confirm dialog bnan wo reason pocha ga -->
<!-- 23. same pending registration me -->
<!-- 24. sub role edit princpal krne add -->
<!-- 25. sub role me create role dalna -->
<!-- 26. spacing of bread crumb should be match -->
<!-- 27. filter search teacher list ko change school ki tarah -->
<!-- 28. onboard ki tarah teacher add -->
<!-- 29. filter sron ka change krna  -->
<!-- 30. error state har jagah ani hai -->
<!-- 31. component aniamtion add krna  -->
<!-- 32. back to registery urado -->
<!-- 33. kpi reuse in teacher dETAIL -->
<!-- 34. STUDENT TEACHER KI TARAH DETAILS BNANA -->
<!-- 35. STUDENTS KA TEACHER KI TARAH PAGE BANNANA -->
<!-- 36. 404 PAGE NOT FOUND DIKHANA HAI AUTHORIZED NAI -->
<!-- 37. BREad crumb add krna add  -->
<!-- * Three options for Principals in Role Selector (University Principal, College  Principal and School Principal) -->
<!-- * Add One more Role: Teacher -->
<!-- * Teacher Dashboard will contain the same as we have on Teacher Detailing page for Principal -->
<!-- * Lectures have Mark Attendance option. clicking route user to new page where teacher will mark attendance as you do in Your LMS
* Provide principal a settings page (side) as we have in twitter, youtube, facebook. Allow principal to set the Institute Close Timing
* after closing, teacher shouldn't be allowed to edit / mark attendance. He now has options to request edit / mark attendance. This request will directly go to Principal (HOD in case of University).
* place a notification icon somewhere in the side or header in principal / HOD dashboard, 
* also please create a separate notification page for all roles
* once the HOD / Principal allow editing, they allow have to justify this action (why he are allowing) and also has to set till time (until when the editing is allowed)         

<!-- attendance page pe hi modal mark vala thek hai  -->
<!-- 1. class create -->
<!-- 2. create subject -->
<!-- 3. assign teaher class and subject -->
<!-- schedule -->

<!-- close me text area mount umponunt in cloes scholl -->
<!-- add department form  issue -->
<!-- (Photo delete and leadership)principal assignment flow here -->
<!-- Academic & Schedule Matrix (departmetn and class level aslo add their filter)delete button  mark attenedct -->
<!-- searching issue in assign proxy -->
<!-- Attendece monitor add filter class dep dynamic agar koi computer science to sirf computer science dikhni chahiye -->
<!-- extra mark attendece form fix -->
<!-- leave filter -->
<!-- pendig registration on sidebar   -->
<!-- subrole fix  -->
<!-- status filter height brabaer -->
### Added Principal Attendance Marking Route
- [x] Locate Teacher Lecture Attendance modules (read-only)
- [x] Create Principal "Mark Attendance" page (using reusable components)
- [x] Implement Navigation from Attendance Monitor
- [x] Implement Edit-with-Reason Requirement
- [x] Remove Permission Requirement (Principal Only)

<!-- add student
add school etc -->
<!-- school registry name one line -->
<!-- college level classes -->
<!-- grades  -->
lecture as
<!-- assignment HOD loader on its button -->
<!-- har form ke upar aik error state -->
HOD lecture request assignment
Add new class page in assign subject pages on new class
[x] add filter in acadmic matrix in hod
[x] instead of cs write acadmic shedile
[x] if no lecture selected show select a calss in martix
teacher assign if my departmetn if other department so show departmetn for to reqquest other department
Assign HOD first assign Teacher when we assign hod it show related deparment Teacher for assignment
<!-- Department and HOD Flow:
- Create Department (State: Pending Assingment)
- Add Teachers in that Department
- Assign HOD to that department from the teachers. -->

<!-- Lecture Assignment Flow (keep it simple):
* Assign lecture to a class
* Assign teacher -->

Create a new Page:
- Techer Scheduling (a page opens listing have timetable like screen showing which teachers are on which time, provide filters against teacher)
- only show two teacher's name in one box with see more option opening a modal listing all the teachers scheduled at that time slot