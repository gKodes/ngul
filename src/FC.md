# nuFileChooser
An simple wraper around `input type="file"` making it a bit more attractive.

    <label class="nu file chooser" style="position: relative;">
      <input type="file"/><span></span>
      <a class="remove"></a>
    </label>
The File Chooser is achieved using an `input type="file"` which is warped around by a `label`.

#### A Switch <small>An Default Switch</small>

<nu-file-chooser ng-model="fcDemo" ng-init="fcDemo = 'Happy to Play Song.mp3'"></nu-file-chooser>
Selected File Name: **{{fcDemo.name}}**

    <nu-file-chooser ng-model="fcDemo"></nu-file-chooser>


#### Display Type <small>Show the type of file selected</small>
<nu-file-chooser class="diplay-type" ng-model="fcDemo2" ng-init="fcDemo2 = 'Product Literature.pdf'"></nu-file-chooser>
Selected File Name: **{{fcDemo2.name}}**

    <nu-file-chooser class="diplay-type" ng-model="fcDemo"></nu-file-chooser>

Displays the type of file instead of extension, example: mp3 as audio, avi as video.

#### Fugue Icons <small>Show file icons</small>
<nu-file-chooser class="fugue blue" ng-model="fcDemo3" ng-init="fcDemo3 = 'Monthly Expense.xsl'"></nu-file-chooser>
Selected File Name: **{{fcDemo3.name}}**

    <nu-file-chooser class="fugue blue" ng-model="fcDemo"></nu-file-chooser>
Displays Fugue icons instead of extension.
>**Note:** Need to include `mime.fugue.min.css` style sheet for displaying fugue icons.
Please refer [Fugue Icons](http://p.yusukekamiyamane.com/index.html.en) website for more details regarding the icon's license

#### Default / Pre-set Value <small>Show an value by default</small>
<div ng-init="fcDemo4 = 'Happy Times.avi'">
  <nu-file-chooser class="fugue blue" ng-model="fcDemo4"></nu-file-chooser>
</div>
Selected File Name: **{{fcDemo4.name || fcDemo4}}**

    <div ng-init="fcDemo = 'Happy Times.avi'">
      <nu-file-chooser class="fugue blue" ng-model="fcDemo"></nu-file-chooser>
    </div>

Displays Fugue icons instead of extension.
>**Note:** Need to include `mime.fugue.min.css` style sheet for displaying fugue icons.
Please refer [Fugue Icons](http://p.yusukekamiyamane.com/index.html.en) website for more details regarding the icon's license

#### Attributes
`ng-model` -- model to be bound in the given scope, this can be a `string` or `File Object`.
