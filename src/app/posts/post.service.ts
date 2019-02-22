import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({providedIn: 'root'})
export class PostService {
  private posts: Post[] = [];
  private updatedPosts = new Subject<{posts: Post[], postCount: number}>();
  private requestIp = window.location.hostname;
  private ipPattern = new RegExp('[0-9]{1,3}[.]{1}[0-9]{1,3}[.]{1}[0-9]{1,3}[.]{1}[0-9]{1,3}');

  constructor(private http: HttpClient, private router: Router) {}

  getAllPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any, totalPosts: number }>(
      BACKEND_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            if (post.imagePath) {
              post.imagePath = post.imagePath.replace(this.ipPattern, this.requestIp)
                .replace('localhost', this.requestIp);
            }
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          totalPosts: postData.totalPosts
        };
      }))
      .subscribe(transformedPostsData => {
        this.posts = transformedPostsData.posts;
        this.updatedPosts.next({
          posts: [...this.posts],
          postCount: transformedPostsData.totalPosts
        });
    });
  }

  getUpdatedPosts(): Observable<{posts: Post[], postCount: number}> {
    return this.updatedPosts.asObservable();
  }

  getPost(id: string) {
      return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(
        BACKEND_URL + '/' + id
      );
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string, post: Post }>(
        BACKEND_URL,
         postData)
      .subscribe(responseData => {
        this.router.navigate(['/']);
      }, (error) => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put<Post>(BACKEND_URL + id, postData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      }, (error) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
