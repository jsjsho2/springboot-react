# 실행/빌드 방법

### [최초 다운로드 시]
>1. node 설치
>2. terminal 탭/cmd 창을 열고 루트/frontend 경로로 이동
>3. npm install

### [개발용도로 로컬에서 실행시]
package.json - proxy port 알맞게 수정
>1. 스프링부트 실행
>2. terminal 탭/cmd 창을 열고 루트/frontend 경로로 이동
>3. npm start
>4. xxx.xxx.xxx.xxx:3000 접근

### [배포용도로 빌드시]
package.json - proxy port 알맞게 수정
>* .jar
>1. terminal 탭/cmd 창을 열고 루트 경로로 이동
>2. gradlew build
>3. 프로젝트 루트 경로 밑 build/libs/xxxxxxxxxx.jar 배포
>6. java -jar 파일PATH/xxxxxxxxxx.jar
>7. xxx.xxx.xxx.xxx:PORT 접근

>* .war
>1. terminal 탭/cmd 창을 열고 루트 경로로 이동
>2. gradlew build
>3. 프로젝트 루트 경로 밑 build/libs/xxxxxxxxxx.war 배포
>6. java -jar 파일PATH/xxxxxxxxxx.jar
>7. xxx.xxx.xxx.xxx:PORT 접근"# springboot-react" 
